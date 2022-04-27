

<script>
    import { onMount } from "svelte";

    let socketReady = false;
    let mounted = false;
    let socket;

    onMount(() => {
        mounted = true;
        if (socketReady) {
            loadSocket();
        }
    })

    function socketLoaded() {
        socketReady = true;
        if (mounted) {
            loadSocket();
        }
    }

    function loadSocket() {
        socket = io();
    }

</script>

<svelte:head>
    <script src="/socket.io/socket.io.js" on:load={socketLoaded}></script>
</svelte:head>

<div>
    <h1>COLOR</h1>
    
    <button on:click={socket.emit("chat message", "hej med dig")}>Add message</button>
</div>