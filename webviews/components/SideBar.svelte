<script>
  import { onMount } from 'svelte';
  import snarkdown from 'snarkdown';
  import { Pulse } from 'svelte-loading-spinners';
  import { createClient } from '@supabase/supabase-js';
  import { SvelteToast , toast } from '@zerodevx/svelte-toast';
  import { copy } from 'svelte-copy';
  import * as routes from '../routes.json'
  export let theme;

  const supabaseUrl = routes.supabaseUrl;
  const supabaseKey = routes.supabaseKey;
  const supabase = createClient(supabaseUrl, supabaseKey);

  let email, password, newMessage, user_id, session, bg_colour, api_key = '';
  let messages = [];
  let history = [];
  let activeTab = 'chat';
  let model = 'text-davinci-003';
  const fundiV1 = routes.fundiV1;

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

  function saveToken(token, apiKey) {
    tsvscode.postMessage({
					type: 'authenticate',
					value: token,
          key: apiKey
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

      session = data;
      user_id = session.user.id;
      keyFetch(user_id);
      historyFetch(api_key, user_id);

      saveToken(data, api_key);
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
    const messageBody = {type: 'Query', data: `<span style="color:#808080; font-weight: bold;">${endpointName}: </span> </br> ${message.value} `};
    messages = [...messages, messageBody];

    // Loading message
    const messageLoading = {type: 'Waiting', data: '<span style="color:#808080; font-weight: bold;">Thinking 🧠</span>'};
    messages = [...messages, messageLoading];

    let res = "";

    fetch(`${fundiV1}/v1/fundi/${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Transfer-Encoding': 'chunked',
        'X-Content-Type-Options': 'nosniff'
      },
      body: JSON.stringify(data)
    })
      .then(response => {
        const reader = response.body.getReader();

        function read() {
          reader.read().then(({ done, value }) => {
            if (done) {
              // Stream finished, perform any necessary actions
              saveMessages(messages);
              return;
            }

            const chunk = new TextDecoder('utf-8').decode(value);
            res = res + chunk;
            messages.pop();
            const messageResponse = {type: 'Response', data: res};
            messages = [...messages, messageResponse];

            read();
          });
        }

        read();
      })
      .catch(error => {
        console.error('Request error:', error);
        // Handle any errors from the request
      });
  } 

  function askFundi() {
    let data = {
        user_id: user_id,
        api_key: api_key,
        model: model,
        code_block: '',
        question: newMessage
      };
    let message = {
      value: newMessage
    }
    fundiAPI(message, 'ask', data);
  }

  function saveFeedback(message, user_feedback) {
    let data = {
        user_id: user_id,
        api_key: api_key,
        response: message,
        user_feedback: user_feedback
      };

    fetch(`${fundiV1}/v1/fundi/feedback`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Transfer-Encoding': 'chunked',
        'X-Content-Type-Options': 'nosniff'
      },
      body: JSON.stringify(data)
    })
      .then(response => {
        toast.push(`Feedback has been saved`);
      })
      .catch(error => {
        toast.push(`Problem saving feedback`);
        // Handle any errors from the request
      });
  }

  function keyFetch(userId) {
    let data = {
        user_id: userId
      };

    fetch(`${fundiV1}/v1/fundi/keyfetch`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(data => {
      api_key = data[0].key;
    })
    .catch(error => {
      toast.push(`Problem saving feedback`);
      // Handle any errors from the request
    });
  }

  function historyFetch(apiKey, userId) {
    let data = {
        user_id: userId,
        api_key: apiKey
      };

    fetch(`${fundiV1}/v1/fundi/history`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(data => {
      history = data;
    })
    .catch(error => {
      toast.push(`Problem saving feedback`);
      // Handle any errors from the request
    });
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
              user_id: user_id,
              api_key: api_key,
              model: model,
              code_block: message.value
            };
          fundiAPI(message, message.type, data);
          break;

        case 'ask':
          data = {
              user_id: user_id,
              api_key: api_key,
              model: model,
              code_block: message.value
            };
          fundiAPI(message, message.type, data);
          break;

        case 'explain':
          data = {
              user_id: user_id,
              api_key: api_key,
              model: model,
              code_block: message.value
            };
          fundiAPI(message, message.type, data);
          break;

        case 'generate':
          data = {
              user_id: user_id,
              api_key: api_key,
              model: model,
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
          const key = message.key;

          // Handle the token received from the extension
          if (token === undefined) {
            session = '';
          }
          else {
            session = token;
            user_id = session.user.id;
          }
          // Handle the api key received from the extension
          if (key === undefined) {
            api_key = '';
          }
          else {
            api_key = key;
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
    margin-top: 20px;
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
  flex-direction: column;
  margin: 4px;
  margin-top: 16px;
  margin-bottom: 8px;
  align-items: flex-start;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
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

  .message-container {
    width: 90%;
    position: fixed;
    top: 40px;
    bottom: 60px;
    overflow-y: scroll;
  }

  .chat-input {
    flex: 1;
    padding: 8px;
    border: 1px solid #ccc;
    border-radius: 4px;
		width: 100%;
    height: 40px; 
    min-height: 40px;
    max-height: 120px;
  }

.feedback-button {
  background-color: #0070F300;
  cursor: pointer;
  width: 20px;
  margin-top: 5px;
  border-radius: 4px;
  justify-self: start;
  font-size: 11px;
}

  .send-button {
    padding: 8px;
    background-color: #0071f380;
    color: var(bg_colour);
    cursor: pointer;
		width: 40px;
    margin-left: 8px;
    border-radius: 4px;
  }

  .send-button:hover {
    padding: 8px;
    background-color: #0071f3;
    color: var(bg_colour);
    cursor: pointer;
		width: 40px;
    margin-left: 8px;
    border-radius: 4px;
  }

  .send-button:disabled {
    padding: 8px 16px;
    background-color: #808080;
    color: white;
    cursor: not-allowed;
		width: 40px;
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
    margin-top: 0px;
    margin-bottom: 16px;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 9999; /* Optional z-index to ensure it's above other elements */
    background-color: #0071f380;
  }

  .tab {
    padding: 8px 16px;
    color: var(bg_colour);
    cursor: pointer;
  }

  .tab.active {
    text-decoration: underline;
  }

  .form-container {
    display: flex;
    align-items: center;
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
    <div class='message-container'>
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
          <div class='message-response'>
            <div class='loader'>
              <Pulse size='20' color='#e81224' unit='px' duration='13s' />
            </div>
            {@html snarkdown(message.data)}
            <br/>
            <button class = "feedback-button" on:click={saveFeedback(message.data, "CORRECT")}>👍🏽</button>
            <button class = "feedback-button" on:click={saveFeedback(message.data, "INCORRECT")}>👎🏽</button>
            <button class = "feedback-button" use:copy={message.data} on:svelte-copy={(event) => toast.push(`Copied to clipboard`)}>📋</button>
          </div>
        {/if}
        
      {/each}
    </div>
    {/if}

    <div class='message-box'>
      <form on:submit|preventDefault={() => newMessage = ''} class='form-container'>
        <textarea type='text' class='chat-input' bind:value={newMessage} placeholder='Type in your question' />
        <button class='send-button' on:click={askFundi}>🔍</button>
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

