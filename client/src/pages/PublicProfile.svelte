<script>
    import { socketStore } from "../stores.js";
    import { io } from "socket.io-client";
    
    export let userId;

    let textFieldOpen = false;
    let messageText = "";
    let result = undefined;

    let socket;
    socketStore.subscribe((value) => socket = value);

    if (!socket.connected) {
        socketStore.set(io());
    }

    function writeMessage() {
        textFieldOpen = true;
    }

    function sendMessage() {
        socket.emit("chat message", userId, messageText);
        textFieldOpen = false;
    }
</script>
<h1>This is a public profile for {userId}</h1>
<button on:click={writeMessage}>Send a private message</button>

{#if textFieldOpen}
<label for="message-text">Write your message here:</label><br>
<textarea id="message-text" cols="30" rows="10" bind:value={messageText}></textarea><br>
<button on:click={sendMessage}>Send</button>
{/if}

{#if result}
<p>{result}</p>
{/if}