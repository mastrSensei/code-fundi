<script>
  import { onMount } from "svelte";
  import axios from 'axios';
  import snarkdown from 'snarkdown';
  import { Pulse } from 'svelte-loading-spinners';
  import { createClient } from '@supabase/supabase-js';
  import { SvelteToast , toast } from '@zerodevx/svelte-toast';

  const supabaseUrl = '';
  const supabaseKey = '';
  const supabase = createClient(supabaseUrl, supabaseKey);

  let email = '';
  let password = '';
  let messages = [];
  let newMessage = "";
  const fundiV1 = '';
  const api_key = "";
  let session = "";

  async function handleSignup() {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        console.error('Signup error:', error.message);
        toast.push(`Signup error: ${error.message}`);
        return;
      }

      console.log('Signup success:', data);
      toast.push(`Signup successful`);
    } catch (error) {
      console.error('Signup error:', error.message);
      toast.push(`Signup error: ${error.message}`);
    }
  }

  async function handleLogin() {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Login error:', error.message);
        toast.push(`Login error: ${error.message}`);
        return;
      }

      session = data.session;
      console.log('Login success:', data);
      toast.push(`Login successful`);
    } catch (error) {
      console.error('Login error:', error.message);
      toast.push(`Login error: ${error.message}`);
    }
  }

  async function handleOAuth(provider) {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: provider
      });

      if (error) {
        console.error('Login error:', error.message);
        return;
      }

      console.log('Login success:', data);
    } catch (error) {
      console.error('Login error:', error.message);
    }
  }

  function fundiAPI(message, endpoint, data) {
    const endpointName = endpoint.charAt(0).toUpperCase() + endpoint.slice(1);
    const messageBody = {type: 'Query', data: `<span style="color:#808080; font-weight: bold;">${endpointName}: </span>   ${message.value}`};
    messages = [...messages, messageBody];

    // Loading message
    const messageLoading = {type: 'Waiting', data: '<span style="color:#808080; font-weight: bold;">Thinking 🧠</span>'};
    messages = [...messages, messageLoading];

    axios({
      method: 'POST',
      url: `${fundiV1}/v1/fundi/${endpoint}`,
      data: data,
      headers: {
        "Content-Type": "application/json",
      },
      responseType: 'stream'
    })
    .then(response => {
      // convert response to markdown
      response = response.data.replace(/\n/g, ' ').replace(/\t/g, '&emsp;').replace(/\r/g, ' ')
      messages.pop();
      const messageResponse = {type: 'Response', data: JSON.stringify(response)};
      messages = [...messages, messageResponse];
    })
    .catch(error => {
      // Handle any errors
      console.error(error);
    });
  } 

  function askFundi() {
    let data = {
        api_key: api_key,
        code_block: '',
        question: newMessage
      };
    let message = {
      value: newMessage
    }
    fundiAPI(message, 'ask', data);
  }

  onMount(() => {
    window.addEventListener('message', event => {
      const message = event.data; // The json data that the extension sent
      console.log(message)
      let data = {};

      switch (message.type) {
        case 'debug':
          data = {
              api_key: api_key,
              code_block: message.value
            };
          fundiAPI(message, 'debug', data);
          break;

        case 'ask':
          data = {
              api_key: api_key,
              code_block: message.value
            };
          fundiAPI(message, 'ask', data);
          break;

        case 'explain':
          data = {
              api_key: api_key,
              code_block: message.value
            };
          fundiAPI(message, 'explain', data);
          break;

        case 'generate':
          data = {
              api_key: api_key,
              code_block: message.value
            };
          fundiAPI(message, 'generate', data);
          break;
      }
    });
  });
</script>

<style>
  .chat {
    display: flex;
    flex-direction: column;
    height: 100%;
    padding: 16px;
  }

  .banner {
    margin-bottom: 8px;
    padding: 8px;
    color: #ffffff;
		text-align: center;
    font-weight: bold;
    font-size: x-large;
  }

  .welcome {
    margin-bottom: 8px;
    padding: 8px;
    color: #ffffff;
		text-align: center;
  }

  .message {
    margin-bottom: 8px;
    padding: 8px;
    border: 1px solid #ccc;
    border-radius: 4px;
    color: #ffffff;
  }

  .message-response {
    margin-bottom: 8px;
    padding: 8px;
    border: 1px solid #ccc;
    border-radius: 4px;
    color: #ffffff;
    background-color: rgba(0, 112, 243, 0.3);
  }

  .loader {
    padding: 5px;
  }

  .message-box {
    display: flex;
    flex-direction: column; /* Update: Change the flex direction to column */
    margin-top: 16px;
    align-items: flex-end; /* Update: Align items to the start */
    margin-top: auto;
  }

  .message-box form {
		width: 100%;
  }
  .message-input {
    flex: 1;
    padding: 8px;
    border: 1px solid #ccc;
    border-radius: 4px;
		width: 100%;
    margin-bottom: 8px;
  }

  .send-button {
    padding: 8px 16px;
    background-color: #0071f300;
    border: 2px solid;
    border-image: linear-gradient(to right, #0070F3, #e81224);
    border-image-slice: 1;
    color: white;
    cursor: pointer;
		width: 100%;
    margin-bottom: 8px;
  }

  .send-button:hover {
    padding: 8px 16px;
    background-color: #0071f38a;
    border: 2.5px solid;
    border-image: linear-gradient(to right, #0070F3, #e81224);
    border-image-slice: 1;
    color: white;
    cursor: pointer;
		width: 100%;
    margin-bottom: 8px;
  }
</style>

<SvelteToast options={{ theme: { '--toastBarHeight': 0 } }}/>

<div class="chat">
  {#if messages.length === 0 && session !== ""}
    <div class="banner">{@html "Code Fundi 👷🏽‍♂️" }</div>
      
    <div class="welcome">{@html 
      "To get started, type in the message box below or highlight your code then right click to access the options."
    }</div>  
  {:else if messages.length === 0 && session === ""}
    <div class="banner">{@html "Code Fundi 👷🏽‍♂️" }</div>
        
    <div class="welcome">{@html 
      "To get started, sign in / sign up below"
    }
      <form>
        <div class="banner">
          <button type="button">Login with GitHub</button>
          <br/>
          <button type="button">Login with Google</button>
        </div> 
        <br/>
        <input type="email" id="email" bind:value={email} placeholder="Email" />

        <input type="password" id="password" bind:value={password} placeholder="Password" />

        <button type="button" on:click={handleLogin}>Sign In</button>
        <button type="button" on:click={handleSignup}>Sign Up</button>
      </form>

    </div> 
  {:else}
    {#each messages as message}

      {#if message.type === 'Query'}
        <div class="message">{@html message.data}</div>
      {:else if message.type === 'Waiting'}
        <div class="message-response">{@html snarkdown(message.data)}
          <div class="loader">
            <Pulse size="20" color="#e81224" unit="px" duration="3s" />
          </div>
        </div>
      {:else if message.type === 'Response'}
        <div class="message-response">{@html snarkdown(message.data)}</div>
      {/if}
      
    {/each}
  {/if}

  <div class="message-box">
    <form on:submit|preventDefault={() => newMessage = ''}>
      <input type="text" class="message-input" bind:value={newMessage} />
      <button class="send-button" on:click={askFundi}>Ask a question</button>
    </form>
  </div>
</div>
