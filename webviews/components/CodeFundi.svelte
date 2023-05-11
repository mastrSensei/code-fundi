<link rel="stylesheet" href="bundle.css" />

<script>
    // import '../../out/compiled/bundle.css';
  let messages = [];
  let newMessage = "";

  function sendMessage() {
    if (newMessage.trim() !== "") {
      messages = [...messages, newMessage];
      newMessage = "";
    }
  }
</script>

<style>
  .chat {
    display: flex;
    flex-direction: column;
    height: 400px;
    padding: 16px;
    border: 1px solid #ccc;
    border-radius: 4px;
  }

  .message {
    margin-bottom: 8px;
    padding: 8px;
    background-color: #eee;
    border-radius: 4px;
  }

  .message-box {
    display: flex;
    margin-top: 16px;
  }

  .message-input {
    flex: 1;
    padding: 8px;
    border: 1px solid #ccc;
    border-radius: 4px;
  }

  .send-button {
    margin-left: 8px;
    padding: 8px 16px;
    background-color: #4caf50;
    border: none;
    border-radius: 4px;
    color: white;
    cursor: pointer;
  }
</style>

<div class="chat">
  {#each messages as message}
    <div class="message">{message}</div>
  {/each}

  <div class="message-box">
    <input type="text" class="message-input" bind:value={newMessage} />
    <button class="send-button" on:click={sendMessage}>Send</button>
  </div>
</div>
