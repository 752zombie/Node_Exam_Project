<script>
    let chatInput = "";
    let userToSendTo = "";
    let socket;

    function loadSocket() {
        socket = io();
        socket.on("chat message", (data) => {
            console.log(data);
        })
    }

    function sendMessage() {
        //console.log(userToSendTo);
        socket.emit("chat message", userToSendTo, chatInput);
    }

</script>

<svelte:head>
    <script async="false" src="/socket.io/socket.io.js" on:load={loadSocket}></script>
</svelte:head>

<div>
    <h1>COLOR</h1>
    <input type="text" bind:value={chatInput}>
    <input type="text" bind:value={userToSendTo}>
    
    <button on:click={sendMessage}>Add message</button>
</div>