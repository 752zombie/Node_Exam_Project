<script>
    import { io } from "socket.io-client";
    import { socketStore } from "../stores.js";
    import { onMount } from "svelte";
    import MessageTab from "../components/MessageTab.svelte";

    onMount(fetchConversations);

    // key: username, value: array of messages to and from that user
    let conversations = new Map();
    
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

    async function fetchConversations() {
        const response = await fetch("http://localhost:8080/conversations");
        const data = await response.json();
        console.log(data);
        if (data.result === "success") {
            for (let conversation of data.data) {
                conversations.set(conversation.conversationId, 
                {
                    isCached : false,
                    conversationId : conversation.conversationId,
                    userId : conversation.userId,
                    username : conversation.username,
                    messages : []
                });
            }

            conversations = conversations;
        }
    }

    async function fetchConversation(id) {
        const response = await fetch("http://localhost:8080/conversations/" + id);
        const data = await response.json();

        return data.result === "success" ? data.messages : [];
    } 

    function filterIncomingMessage(data) {
        const sender = data.sender;
        const conversationId = data.conversationId;


        const conversation = conversations.get(conversationId);
        const messages = conversation.messages;

        if (!conversation) {
            conversations.set(conversationId, 
            {
                isCached : true,
                conversationId : conversationId,
                userId : data.senderId,
                username : sender,
                messages : [data.text]
            });
            conversations = conversations;
        }

        else {
            conversations.set(sender, [...messages, data]);
            //TODO: notify MessageTab that there is a new message
        }
        
    }

    function sendMessage() {
        //console.log(userToSendTo);
        if (socket) {
            socket.emit("chat message", userToSendTo, chatInput);
        }
    }

    async function showChatContents(event) {
        const conversation = conversations.get(event.detail.conversationId);

        let messages = [];

        if (!conversation.isCached) {
            //fetch messages from server
            constmessages = await fetchConversation(conversation.conversationId);
            conversation.isCached = true;
        }

        



    
        for (let message of messages) {
            console.log("%s says: %s", message.sender_id, message.text);
        }
    }


</script>

<h1>Messages</h1>

{#each Array.from(conversations.values()) as conversation}
    <MessageTab conversation={conversation} on:usernameClicked={showChatContents}></MessageTab>
{/each}

    
<div>
    <input type="text" bind:value={chatInput}>
    <input type="text" bind:value={userToSendTo}>
    
    <button on:click={sendMessage}>Add message</button>
    <button on:click={fetchConversations}>Fetch users</button>
</div>