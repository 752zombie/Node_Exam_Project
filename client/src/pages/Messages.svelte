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

    onMount(fetchConversationsShallow);

    // key: conversation id, value: object which contains conversation metadata and the actual messages
    let conversations = new Map();
    let activeConversation;
    let writeMessageField = "";
    let activeMessages;

    $: activeMessages = activeConversation ? activeConversation.messages : [];
    
    let socket;
    socketStore.subscribe((value) => socket = value);

    let user;
    userStore.subscribe((value) => user = value);

    if (!socket.connected) {
        socketStore.set(io());
    }


    socket.off();

    socket.on("chat message", (data) => {
        filterIncomingMessage(data);
    })

    // function to trigger svelte reactivity on conversations
    function renderConversations() {
        conversations = conversations;
    }

    function setActiveConversation(conversation) {
        activeConversation = conversation;
    }

    function clearMessageField() {
        writeMessageField = "";
    }

    

    // get enough data about all conversations the currently logged in user is a part of to display username and fetch conversation content lazily
    async function fetchConversationsShallow() {
        const response = await fetch("http://localhost:8080/conversations");

        if (response.ok) {
            const data = await response.json();
            
            for (let conversation of data.data) {
                conversations.set(conversation.conversationId, 
                {
                    isCached : false,
                    conversationId : conversation.conversationId,
                    userId : conversation.userId, // user id of person you are communicating with
                    username : conversation.username,
                    messages : [],
                    numberOfNewmessages : 0
                });
            }

            renderConversations();
        }
    }

    // fetch the messages of single conversation and put them into the appropriate conversation 
    async function fetchConversation(id) {
        const response = await fetch("http://localhost:8080/conversations/" + id);

        if (response.ok) {
            const data = await response.json();
            const conversation = conversations.get(id);
            conversation.messages = data.messages;
            conversation.isCached = true;
        }

    } 

    // put message in correct conversation
    function filterIncomingMessage(data) {
        const sender = data.sender;
        const conversationId = data.conversationId;
        
        let conversation = conversations.get(conversationId);

        if (!conversation) {
            conversations.set(conversationId, 
            {
                isCached : true,
                conversationId : conversationId,
                userId : data.senderId,
                username : sender,
                messages : [{text : data.text, senderId : data.senderId}],
                numberOfNewmessages : 0
            });
        }

        else {
            conversation.messages.push({text : data.text, senderId : data.senderId});
        }

        conversation = conversations.get(conversationId);

        if (!activeConversation) {
            conversation.numberOfNewmessages++
        }

        else if (activeConversation.conversationId !== conversation.conversationId) {
            conversation.numberOfNewmessages++
        }
        
        renderConversations();
        
        setActiveConversation(activeConversation);

        
    }

    // called when clicking on username on the left
    // triggers rerender of active chat window
    async function showChatContents(event) {
        const conversation = conversations.get(event.detail.conversationId);

        conversation.numberOfNewmessages = 0;

        if (!conversation.isCached) {
            //fetch messages from server
            await fetchConversation(conversation.conversationId);
        }

        clearMessageField();
        renderConversations();
        setActiveConversation(conversation);
    }


    // delete currently active conversation
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

            if (response.ok) {
                conversations.delete(activeConversation.conversationId);
                setActiveConversation(undefined);
                renderConversations();
            }

            else {
                console.log("something went wrong");
            }
        }


    }

    // send message to currently active conversation
    function sendMessage() {
        if (activeConversation && /[^\s]/g.test(writeMessageField)) {
            socket.emit("chat message", activeConversation.userId, writeMessageField);
            activeConversation.messages.push({senderId : user.userId, text : writeMessageField});
            
            clearMessageField();
            setActiveConversation(activeConversation);
        }
    }

    // send message when enter key is pressed
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
<div id="outer">
    <!-- List to the left of conversations (displayed as usernames) -->
    <div id="outer-users">
        <h2 id="users-header">Active conversations</h2>
        <div id="users">
            {#each Array.from(conversations.values()) as conversation}
                <MessageTab conversation={conversation} on:usernameClicked={showChatContents} numberOfNewmessages={conversation.numberOfNewmessages}></MessageTab>
            {/each}
        </div>    
    </div>

    <!-- Chat window-->
    <div id="outer.chat">
        <h2>{activeConversation ? "Currently chatting with: " + activeConversation.username : "Pick a user to the left to start chatting"}</h2>
        
        <div id="active-chat">
            {#each activeMessages as message}
                <div class={user.userId === message.senderId ? "right" : "left"}>
                    <pre>{message.text}</pre>
                </div>
            {/each}
        </div>
    </div>

    <!-- DO NOT DELETE - is for styling-->
    <div id="invisible"></div>
</div>




<!-- Message field and buttons-->
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
        text-align: left;
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

    #outer-users {
        flex: 1;
    }

    #invisible {
        flex: 1;
    }

    #outer {
        display: flex;
    }

    #users-header {
        text-align: left;
    }

    button {
        cursor: pointer;
    }
    
</style>