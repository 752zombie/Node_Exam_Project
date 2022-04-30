<script>
    export let username;
    export let newMessageReceived = false;
</script>

<div>
    <span>
        <span>{username + " "}</span>
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
    }
</style>