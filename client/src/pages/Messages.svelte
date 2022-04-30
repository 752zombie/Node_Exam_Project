<script>
    import { io } from "socket.io-client";
    import { socketStore } from "../stores.js";
    import MessageTab from "../components/MessageTab.svelte";

    // key: username, value: array of messages to and from that user
    let users = new Map();
    
    let chatInput = "";
    let userToSendTo = "";
    
    let socket;
    socketStore.subscribe((value) => socket = value);

    if (!socket.connected) {
        socketStore.set(io())
        socket.on("chat message", (data) => {
            console.log(data);
            filterIncomingMessage(data);
        })

        socket.on("connect", () => {
            console.log("connect: ", socket.id);
        })

        socket.on("reconnect", (attempt) => {
            console.log("reconnect: ", attempt);
        })
    }

    function filterIncomingMessage(data) {
        const from = data.from;

        const messages = users.get(from);

        if (!messages) {
            users.set(from, [data]);
            users = users;
        }

        else {
            users.set(from, [...messages, data]);
            //TODO: notify MessageTab that there is a new message
        }
        
    }

    function sendMessage() {
        //console.log(userToSendTo);
        if (socket) {
            socket.emit("chat message", userToSendTo, chatInput);
        }
    }

    function showChatContents(event) {
        const messages = users.get(event.detail.username);
        for (let message of messages) {
            console.log("%s says: %s", message.from, message.message);
        }
    }


</script>

<h1>Messages</h1>

{#each Array.from(users.keys()) as user}
    <MessageTab username={user} on:usernameClicked={showChatContents}></MessageTab>
{/each}

    
<div>
    <input type="text" bind:value={chatInput}>
    <input type="text" bind:value={userToSendTo}>
    
    <button on:click={sendMessage}>Add message</button>
</div>