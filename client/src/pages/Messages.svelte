<script>
    import { io } from "socket.io-client";
    import { socketStore, userStore } from "../stores.js";
    import { onMount } from "svelte";
    import MessageTab from "../components/MessageTab.svelte";

    onMount(fetchConversations);

    // key: username, value: array of messages to and from that user
    let conversations = new Map();
    let activeConversation;

    $: activeMessages = activeConversation ? activeConversation.messages : [];
    
    let socket;
    socketStore.subscribe((value) => socket = value);

    let user;
    userStore.subscribe((value) => user = value);

    if (!socket.connected) {
        socketStore.set(io());
    }

    console.log("socket connected: ", socket.connected);

    socket.off();

    socket.on("chat message", (data) => {
            filterIncomingMessage(data);
        })

    socket.on("connect", () => {
        console.log("connect: ", socket.id);
    })

    socket.on("reconnect", (attempt) => {
        console.log("reconnect: ", attempt);
    })

    


    async function fetchConversations() {
        const response = await fetch("http://localhost:8080/conversations");
        const data = await response.json();

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

        if (data.result === "success") {
            const conversation = conversations.get(id);
            conversation.messages = data.messages;
            conversation.isCached = true;
            
            return data.messages;
        }

        return [];

    } 

    function filterIncomingMessage(data) {
        console.log(data);
        const sender = data.sender;
        const conversationId = data.conversationId;
        
        const conversation = conversations.get(conversationId);

        if (!conversation) {
            conversations.set(conversationId, 
            {
                isCached : true,
                conversationId : conversationId,
                userId : data.senderId,
                username : sender,
                messages : [{sender : sender, text : data.text, senderId : data.senderId}]
            });
            conversations = conversations;
        }

        else {
            conversations.set(conversationId, {...conversation, messages : [...conversation.messages, {sender : sender, text : data.text, senderId : data.senderId}]});
            //TODO: notify MessageTab that there is a new message
        }
        
    }

    async function showChatContents(event) {
        const conversation = conversations.get(event.detail.conversationId);

        let messages = [];

        if (!conversation.isCached) {
            //fetch messages from server
            messages = await fetchConversation(conversation.conversationId);
        }

        else {
            messages = conversation.messages;
        }
    
        for (let message of messages) {
            console.log("%s says: %s", message.sender, message.text);
        }

        activeConversation = conversation;
    }

</script>

<h1>Messages</h1>

{#each Array.from(conversations.values()) as conversation}
    <MessageTab conversation={conversation} on:usernameClicked={showChatContents}></MessageTab>
{/each}

<h2>{activeConversation ? "Currently chatting with: " + activeConversation.username : "pick a user to the left to start chatting"}</h2>

<div id="active-chat">
    {#each activeMessages as message}
        <div class={user.userId === message.senderId ? "right" : "left"}>
            <p>{message.text}</p>
        </div>
    {/each}
</div>



<style>

    
    #active-chat {
        height: 40vh;
        width: 40vw;
        overflow-y: auto;
        margin-left: auto;
        margin-right: auto;
        border-radius: 3px;
        border-color: blue;
        border-style: solid;
        display: flex;
        flex-direction: column;
    }

    .right {
        margin-left: auto;
        display: inline-block;
        border-style: solid;
        border-color: dodgerblue;
        background-color: dodgerblue;
        border-radius: 5px;
        margin-top: 5px;
        margin-bottom: 5px;
        margin-right: 5px;
        color: white;
        padding: 3px;
    }

    .left {
        margin-right: auto;
        display: inline-block;
        border-style: solid;
        border-color: lightgrey;
        background-color: lightgrey;
        border-radius: 5px;
        margin-top: 5px;
        margin-bottom: 5px;
        margin-left: 5px;
        padding: 3px;
    }
</style>