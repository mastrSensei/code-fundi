<script>
  let messages = [];
  let newMessage = "";

  function sendMessage() {
    if (newMessage.trim() !== "") {
      messages = [...messages, newMessage];
      newMessage = "";
    }
  }

  function callFundi() {
    tsvscode.postMessage({
      type: "onInfo",
      value: "Info message"
    });
  }
</script>

<style>
  .chat {
    display: flex;
    flex-direction: column;
    height: 100%;
    padding: 16px;
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
  {#each messages as message}
    <div class="message">{message}</div>
  {/each}

  <div class="message-box">
    <form on:submit|preventDefault={() => newMessage = ''}>
      <input type="text" class="message-input" bind:value={newMessage} />
      <button class="send-button" on:click={callFundi}>Send a message</button>
    </form>
  </div>
</div>
