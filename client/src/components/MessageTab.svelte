<script>
    import { createEventDispatcher } from 'svelte';
    const dispatch = createEventDispatcher();

    export let conversation;
    export let numberOfNewmessages = 0;


    function sendConversation()  {
        dispatch("usernameClicked", {conversationId : conversation.conversationId});
        numberOfNewmessages = 0;
    }

</script>

<div on:click={sendConversation}>
    <span>
        <span>{conversation.username + " "}</span>
        <span id="new-messages">{numberOfNewmessages > 0 ? `(${numberOfNewmessages})` : ""}</span>
    </span>
</div>

<style>
    div {
        height: 40px;
        width: 200px;
        background-color: lightblue;
        margin-bottom: 7px;
        border-style: solid;
        border-color: aqua;
        border-radius: 5px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
    }

    #new-messages {
        color: green;
    }

    div:hover {
        background-color: rgb(62, 154, 185);
    }
</style>