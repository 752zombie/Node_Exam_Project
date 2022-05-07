<script>
    import { io } from "socket.io-client";
    import { socketStore, userStore } from "../stores.js";
    import { onMount, afterUpdate } from "svelte";
    import MessageTab from "../components/MessageTab.svelte";

    afterUpdate(() => {
        // scroll to buttom of chat
        const activeChatDiv = document.getElementById("active-chat");
        activeChatDiv.scrollTop = activeChatDiv.scrollHeight;
        
        // focus on where text field where you write the message
        document.getElementById("write-message-field").focus();
    })

    onMount(fetchConversations);

    // key: username, value: array of messages to and from that user
    let conversations = new Map();
    let activeConversation;
    let writeMessageField = "";
    let activeMessages;

    $: {activeMessages = activeConversation ? activeConversation.messages : [];
        console.log(activeMessages);
        console.log("reactivity triggered");
    }
    
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

        console.log(data.data);

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

        console.log("reached here")

        activeConversation = conversations.get(activeConversation.conversationId);
        
    }

    async function showChatContents(event) {
        const conversation = conversations.get(event.detail.conversationId);


        if (!conversation.isCached) {
            //fetch messages from server
            await fetchConversation(conversation.conversationId);
        }

        writeMessageField = "";


        activeConversation = conversation;
    }

    function sendMessage() {
        if (activeConversation) {
            socket.emit("chat message", activeConversation.userId, writeMessageField);
            console.log({sender : user.username, senderId : user.userId, text : writeMessageField});
            activeConversation.messages.push({sender : user.username, senderId : user.userId, text : writeMessageField});
            writeMessageField = "";
            activeConversation = activeConversation;

        }
    }

    async function deleteConversation() {
        if (activeConversation) {
            const request = {
                method : "DELETE",
                headers : {
                    "Content-Type" : "application/json"
                },
                body : JSON.stringify({})
            }

            const response = await fetch("http://localhost:8080/conversations/" + activeConversation.conversationId, request);
            const data = await response.json();

            if (data.result === "success") {
                console.log("successfully deleted");
                conversations.delete(activeConversation.conversationId);
                activeConversation = undefined;
                conversations = conversations;
            }

            else {
                console.log("something went wrong");
            }
        }


    }

    function handleKeyPress(event) {
        if (event.key === "Enter" && !event.shiftKey && !event.repeat) {
            event.preventDefault();
            sendMessage();
        }

        else if (!event.shiftKey && event.key === "Enter") {
            event.preventDefault();
        }
    }



</script>

<h1>Messages</h1>
<div id="users">
    {#each Array.from(conversations.values()) as conversation}
        <MessageTab conversation={conversation} on:usernameClicked={showChatContents}></MessageTab>
    {/each}
</div>


<h2>{activeConversation ? "Currently chatting with: " + activeConversation.username : "Pick a user to the left to start chatting"}</h2>

<div id="active-chat">
    {#each activeMessages as message}
        <div class={user.userId === message.senderId ? "right" : "left"}>
            <pre>{message.text}</pre>
        </div>
    {/each}
</div>

<div>
    <textarea id="write-message-field" cols="60" rows="5" placeholder="type a message here" bind:value={writeMessageField}></textarea><br>
    <button on:click={sendMessage}>Send</button><br>
    <button id="delete-button" on:click={deleteConversation}>Delete conversation</button>
</div>


<svelte:window on:keydown={handleKeyPress}/>



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

    pre {
        font-family: Arial, Helvetica, sans-serif;
    }

    #delete-button {
        color: white;
        background-color: red;
    }

    #users {
        width: fit-content;
        height: 20vh;
        overflow-y: auto;
        border: 5px solid blue;
    }
</style>