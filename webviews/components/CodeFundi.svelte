<script>
  import { onMount } from "svelte";
  import axios from 'axios';
  import snarkdown from 'snarkdown';

  let messages = [];
  let newMessage = "";
  const fundiV1 = 'https://code-fundi-api.vercel.app';
  const api_key = "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";

  function debug(){
      tsvscode.postMessage({
        type: 'debug',
        value: newMessage
      });
  }

  function fundiDebug() {
    if (newMessage.trim() !== "") {
      messages = [...messages, newMessage];
      newMessage = "";
    }
    // var message = '';

    // if (event === undefined){
    //   if (newMessage.trim() !== ""){
    //     message = {'type': 'debug', 'value': newMessage};
    //     console.log(message)
    //   }
    // }
    // message = event.data; // The json data that the extension sent
    // console.log(message)

    // switch (message.type) {
    //   case 'debug':
    //     messages = [...messages, `<span style="color:#808080; font-weight: bold;">Debug:</span> <br> ${message.value}`];

    //     // Loading message
    //     messages = [...messages, '<span style="color:#808080; font-weight: bold;">Thinking 🧠...</span>'];

    //     const response = axios({
    //       method: 'POST',
    //       url: `${fundiV1}/v1/fundi/debug`,
    //       data: {
    //         api_key: "",
    //         code_block: message.value
    //       },
    //       headers: {
    //         "Content-Type": "application/json",
    //       },
    //       responseType: 'stream'
    //     })
    //     .then(response => {
    //       messages.pop();
    //       messages = [...messages, JSON.stringify(response.data)];
    //     })
    //     .catch(error => {
    //       // Handle any errors
    //       console.error(error);
    //     });
    //     break;
    // }
  }

  function askFundi() {
    messages = [...messages, `<span style="color:#808080; font-weight: bold;">Ask:</span> <br> ${newMessage}`];

    // Loading message
    messages = [...messages, '<span style="color:#808080; font-weight: bold;">Thinking 🧠...</span>'];

    axios({
      method: 'POST',
      url: `${fundiV1}/v1/fundi/ask`,
      data: {
        api_key: api_key,
        code_block: '',
        question: newMessage
      },
      headers: {
        "Content-Type": "application/json",
      },
      responseType: 'stream'
    })
    .then(response => {
      // convert response to markdown
      response = response.data.replace(/\n/g, '<br>').replace(/\t/g, '&emsp;').replace(/\r/g, '<br>');
      messages.pop();
      messages = [...messages, JSON.stringify(response)];
    })
    .catch(error => {
      // Handle any errors
      console.error(error);
    });

        
  }

  onMount(() => {
    window.addEventListener('message', event => {
      const message = event.data; // The json data that the extension sent
      console.log(message)

      switch (message.type) {
        case 'debug':
          messages = [...messages, `<span style="color:#808080; font-weight: bold;">Debug:</span> <br> ${message.value}`];

          // Loading message
          messages = [...messages, '<span style="color:#808080; font-weight: bold;">Thinking 🧠...</span>'];

          axios({
            method: 'POST',
            url: `${fundiV1}/v1/fundi/debug`,
            data: {
              api_key: api_key,
              code_block: message.value
            },
            headers: {
              "Content-Type": "application/json",
            },
            responseType: 'stream'
          })
          .then(response => {
            // convert response to markdown
            response = response.data.replace(/\n/g, '<br>').replace(/\t/g, '&emsp;').replace(/\r/g, '<br>');
            messages.pop();
            messages = [...messages, JSON.stringify(response)];
          })
          .catch(error => {
            // Handle any errors
            console.error(error);
          });
          break;

        case 'ask':
          messages = [...messages, `<span style="color:#808080; font-weight: bold;">Ask:</span> <br> ${message.value}`];

          // Loading message
          messages = [...messages, '<span style="color:#808080; font-weight: bold;">Thinking 🧠...</span>'];

          axios({
            method: 'POST',
            url: `${fundiV1}/v1/fundi/ask`,
            data: {
              api_key: api_key,
              code_block: message.value
            },
            headers: {
              "Content-Type": "application/json",
            },
            responseType: 'stream'
          })
          .then(response => {
            // convert response to markdown
            response = response.data.replace(/\n/g, '<br>').replace(/\t/g, '&emsp;').replace(/\r/g, '<br>');
            messages.pop();
            messages = [...messages, JSON.stringify(response)];
          })
          .catch(error => {
            // Handle any errors
            console.error(error);
          });
          break;

        case 'explain':
          messages = [...messages, `<span style="color:#808080; font-weight: bold;">Explain:</span> <br> ${message.value}`];

          // Loading message
          messages = [...messages, '<span style="color:#808080; font-weight: bold;">Thinking 🧠...</span>'];

          axios({
            method: 'POST',
            url: `${fundiV1}/v1/fundi/explain`,
            data: {
              api_key: api_key,
              code_block: message.value
            },
            headers: {
              "Content-Type": "application/json",
            },
            responseType: 'stream'
          })
          .then(response => {
            // convert response to markdown
            response = response.data.replace(/\n/g, '<br>').replace(/\t/g, '&emsp;').replace(/\r/g, '<br>');
            messages.pop();
            messages = [...messages, JSON.stringify(response)];
          })
          .catch(error => {
            // Handle any errors
            console.error(error);
          });
          break;

        case 'generate':
          messages = [...messages, `<span style="color:#808080; font-weight: bold;">Generate:</span> <br> ${message.value}`];

          // Loading message
          messages = [...messages, '<span style="color:#808080; font-weight: bold;">Thinking 🧠...</span>'];

          axios({
            method: 'POST',
            url: `${fundiV1}/v1/fundi/generate`,
            data: {
              api_key: api_key,
              code_block: message.value
            },
            headers: {
              "Content-Type": "application/json",
            },
            responseType: 'stream'
          })
          .then(response => {
            // convert response to markdown
            response = response.data.replace(/\n/g, '<br>').replace(/\t/g, '&emsp;').replace(/\r/g, '<br>');
            messages.pop();
            messages = [...messages, JSON.stringify(response)];
          })
          .catch(error => {
            // Handle any errors
            console.error(error);
          });
          break;
          messages = [...messages, `<span style="color:#808080; font-weight: bold;">Complete:</span> <br> ${message.value}`];

          // Loading message
          messages = [...messages, '<span style="color:#808080; font-weight: bold;">Thinking 🧠...</span>'];

          axios({
            method: 'POST',
            url: `${fundiV1}/v1/fundi/complete`,
            data: {
              api_key: api_key,
              code_block: message.value
            },
            headers: {
              "Content-Type": "application/json",
            },
            responseType: 'stream'
          })
          .then(response => {
            // convert response to markdown
            response = response.data.replace(/\n/g, '<br>').replace(/\t/g, '&emsp;').replace(/\r/g, '<br>');
            messages.pop();
            messages = [...messages, JSON.stringify(response)];
          })
          .catch(error => {
            // Handle any errors
            console.error(error);
          });
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
    background-color: #0070F3;
    border: none;
    border-radius: 4px;
    color: white;
    cursor: pointer;
		width: 100%;
    margin-bottom: 8px;
  }
</style>

<div class="chat">
  {#if messages.length === 0}
    <div class="banner">{@html "Code Fundi 👷🏽‍♂️" }</div>
    <br><br>
    <div class="welcome">{@html 
      "To get started, type in the message box below or highlight your code then right click to access the options."
    }</div>   
  {:else}
    {#each messages as message}
      <div class="message">{@html snarkdown(message)}</div>
    {/each}
  {/if}

  <div class="message-box">
    <form on:submit|preventDefault={() => newMessage = ''}>
      <input type="text" class="message-input" bind:value={newMessage} />
      <button class="send-button" on:click={askFundi}>Ask a question</button>
    </form>
  </div>
</div>
