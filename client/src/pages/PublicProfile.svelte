<script>
    import { socketStore } from "../stores.js";
    import { onMount } from "svelte";
    import { io } from "socket.io-client";
    
    export let userId;

    onMount(getUsername);

    let textFieldOpen = false;
    let messageText = "";
    let result = undefined;
    let username = "";

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

    async function getUsername() {
        const response = await fetch("http://localhost:8080/username/" + userId);
        if (response.ok) {
            const data = await response.json();
            username = data.data.username;
        }
    }

</script>
<h1>{username + "'s profile"}</h1>
<button on:click={writeMessage}>Send a private message</button>

{#if textFieldOpen}
<label for="message-text">Write your message here:</label><br>
<textarea id="message-text" cols="30" rows="10" bind:value={messageText}></textarea><br>
<button on:click={sendMessage}>Send</button>
{/if}

{#if result}
<p>{result}</p>
{/if}