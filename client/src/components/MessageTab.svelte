<script>
    import { createEventDispatcher } from 'svelte';
    const dispatch = createEventDispatcher();

    export let conversation;
    export let newMessageReceived = false;

    function sendConversation()  {
        dispatch("usernameClicked", {conversationId : conversation.conversationId});
    }
</script>

<div on:click={sendConversation}>
    <span>
        <span>{conversation.username + " "}</span>
        {#if newMessageReceived}
            <span>(New message!)</span>
        {/if}
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
</style>