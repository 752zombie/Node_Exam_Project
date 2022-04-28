<script>
    let socket;

    function loadSocket() {
        socket = io();
    }

</script>

<svelte:head>
    <script async="false" src="/socket.io/socket.io.js" on:load={loadSocket}></script>
</svelte:head>

<div>
    <h1>COLOR</h1>
    
    <button on:click={socket.emit("chat message", "testUser", "hej med dig")}>Add message</button>
</div>