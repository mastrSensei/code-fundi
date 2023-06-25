<script>
  import { onMount } from 'svelte';
  import axios from 'axios';
  import snarkdown from 'snarkdown';
  import { Pulse } from 'svelte-loading-spinners';
  import { createClient } from '@supabase/supabase-js';
  import { SvelteToast , toast } from '@zerodevx/svelte-toast';
  import * as routes from '../routes.json'
  export let theme;

  const supabaseUrl = routes.supabaseUrl;
  const supabaseKey = routes.supabaseKey;
  const supabase = createClient(supabaseUrl, supabaseKey);

  let email = '';
  let password = '';
  let messages = [];
  let newMessage = '';
  const fundiV1 = routes.fundiV1;
  const api_key = '';
  let session = '';
  let bg_colour = '';
  let activeTab = 'chat';

  function changeTab(tab) {
    activeTab = tab;
  }

  function fetchData() {
    tsvscode.postMessage({
        type: 'tokenFetch'
      });

    tsvscode.postMessage({
        type: 'getMessages'
      });
  }

  function saveToken(token) {
    tsvscode.postMessage({
					type: 'authenticate',
					value: token
				});
  }

  function saveMessages(message) {
    tsvscode.postMessage({
					type: 'saveMessages',
					value: message
				});
  }

  function signOut() {
    tsvscode.postMessage({
        type: 'signOut'
      });
  }

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

      toast.push(`Signup successful. You can sign in now`);
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
      saveToken(data.session);
      toast.push(`Login successful`);
    } catch (error) {
      console.error('Login error:', error.message);
      toast.push(`Login error: ${error.message}`);
    }
  }

  async function handleOAuth(provider) {
    tsvscode.postMessage({
					type: 'oAuthenticate',
					value: provider
				});
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
        'Content-Type': 'application/json',
      },
      responseType: 'stream'
    })
    .then(response => {
      // convert response to markdown
      response = response.data;
      messages.pop();
      const messageResponse = {type: 'Response', data: JSON.stringify(response)};
      messages = [...messages, messageResponse];
      saveMessages(messages);
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
    // Theme handler
    if (theme === 'light'){
      bg_colour = '#808080';
    }
    else{
      bg_colour = '#ffffff';
    }

    fetchData();

    // Message listener
    window.addEventListener('message', event => {
      const message = event.data; // The json data that the extension sent
      let data = {};

      switch (message.type) {
        case 'debug':
          data = {
              api_key: api_key,
              code_block: message.value
            };
          fundiAPI(message, message.type, data);
          break;

        case 'ask':
          data = {
              api_key: api_key,
              code_block: message.value
            };
          fundiAPI(message, message.type, data);
          break;

        case 'explain':
          data = {
              api_key: api_key,
              code_block: message.value
            };
          fundiAPI(message, message.type, data);
          break;

        case 'generate':
          data = {
              api_key: api_key,
              code_block: message.value
            };
          fundiAPI(message, message.type, data);
          break;
        case 'authenticate':
          data = {
              code_block: message.value
            };
          fundiAPI(message, message.type, data);
          break;
        case 'tokenFetchResponse':
          const token = message.value;
          // Handle the token received from the extension
          if (token === undefined) {
            session = '';
          }
          else {
            session = token;
          }
          break;
        case 'getMessagesResponse':
          const messageResponse = message.value;
          // Handle the token received from the extension
          if (messageResponse === undefined) {
            messages = [];
          }
          else {
            messages = messageResponse;
          }
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
    color: var(bg_colour);
		text-align: center;
    font-weight: bold;
    font-size: x-large;
  }

  .welcome {
    margin-bottom: 8px;
    padding: 8px;
    color: var(bg_colour);
		text-align: center;
  }

  .message {
    margin-bottom: 8px;
    padding: 8px;
    border: 1px solid #ccc;
    border-radius: 4px;
    color: var(bg_colour);
  }

  .message-response {
    margin-bottom: 8px;
    padding: 8px;
    border: 1px solid #ccc;
    border-radius: 4px;
    color: var(bg_colour);
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
    background-color: #0071f380;
    color: var(bg_colour);
    cursor: pointer;
		width: 100%;
    margin-bottom: 8px;
  }

  .send-button:hover {
    padding: 8px 16px;
    background-color: #0071f3;
    color: var(bg_colour);
    cursor: pointer;
		width: 100%;
    margin-bottom: 8px;
  }

  .send-button:disabled {
    padding: 8px 16px;
    background-color: #808080;
    color: white;
    cursor: not-allowed;
		width: 100%;
    margin-bottom: 8px;
  }

  .auth-button {
    padding: 8px 16px;
    background-color: #0071f380;
    border: 1px solid;
    border-image: linear-gradient(to right, #0070F3, #e81224);
    border-image-slice: 1;
    color: var(bg_colour);
    cursor: pointer;
		width: 100%;
    margin-bottom: 8px;
  }

  .auth-button:hover {
    padding: 8px 16px;
    background-color: #0071f3;
    border: 1px solid;
    border-image: linear-gradient(to bottom, #0070F3, #e81224);
    border-image-slice: 1;
    color: var(bg_colour);
    cursor: pointer;
		width: 100%;
    margin-bottom: 8px;
  }

  .tab-container {
    display: flex;
    justify-content: center;
    margin-bottom: 16px;
  }

  .tab {
    padding: 8px 16px;
    color: var(bg_colour);
    cursor: pointer;
  }

  .tab.active {
    text-decoration: underline;
  }
</style>

<SvelteToast options={{ theme: { '--toastBarHeight': 0 } }}/>

<svelte:head>
  <meta http-equiv="Content-Security-Policy" content="frame-src 'self' https://aphveiimvupdhrheiipr.supabase.co/">
</svelte:head>

<div class="tab-container">
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <div class="tab {activeTab === 'chat' ? 'active' : ''}" on:click={() => changeTab('chat')}>
    Chat
  </div>
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <div class="tab {activeTab === 'history' ? 'active' : ''}" on:click={() => changeTab('history')}>
    History
  </div>
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <div class="tab {activeTab === 'signOut' ? 'active' : ''}" on:click={signOut}>
    Log out
  </div>
</div>

{#if activeTab === 'chat'}
  <div class='chat'>
    {#if messages.length === 0}
      <div class='banner'>{@html 'Code Fundi 👷🏽‍♂️' }</div>
        
      <div class='welcome'>{@html 
        'To get started, type in the message box below or highlight your code then right click to access the options.'
      }</div>
    {:else}
      {#each messages as message}

        {#if message.type === 'Query'}
          <div class='message'>{@html message.data}</div>
        {:else if message.type === 'Waiting'}
          <div class='message-response'>{@html snarkdown(message.data)}
            <div class='loader'>
              <Pulse size='20' color='#e81224' unit='px' duration='3s' />
            </div>
          </div>
        {:else if message.type === 'Response'}
          <div class='message-response'>{@html snarkdown(message.data)}</div>
        {/if}
        
      {/each}
    {/if}

    <div class='message-box'>
      <form on:submit|preventDefault={() => newMessage = ''}>
        <input type='text' class='message-input' bind:value={newMessage} placeholder='Type in your question' />
        <button class='send-button' on:click={askFundi}>Ask a question</button>
      </form>
    </div>
  </div>
{:else if activeTab === 'history'}
  <div class='chat'>
    {#if session !== ''}
      {#each messages as message}
        <div class='message'>{@html message.data}</div>
      {/each} 
    {:else if session === ''}
      <div class='banner'>{@html 'Code Fundi 👷🏽‍♂️' }</div>
          
      <div class='welcome'>{@html 
        'To get started, sign in / sign up below'
      }
        <div class='banner'>
          <!-- <button type='button' on:click={() => handleOAuth('github')}>Login with GitHub</button>
          <br/>
          <button type='button' on:click={() => handleOAuth('google')}>Login with Google</button> -->
        </div> 
        <br/>
        <form>
          <input type='email' id='email' class='message-input' bind:value={email} placeholder='Email' />

          <input type='password' id='password' class='message-input' bind:value={password} placeholder='Password' />

          <button type='button' class='auth-button' on:click={handleLogin}>Sign In</button>
          <button type='button' class='auth-button' on:click={handleSignup}>Sign Up</button>
        </form>

      </div>
    {/if}
  </div>
{/if}

