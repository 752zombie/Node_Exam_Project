<script>
    export let userId;

    let textFieldOpen = false;
    let messageText = "";
    let result = undefined;

    function writeMessage() {
        textFieldOpen = true;
    }

    async function sendMessage() {
        const request = {
            method : "POST",
            headers : {
                "Content-Type": "application/json"
            },
            body : JSON.stringify({receiver : userId, text : messageText})
        }
        const response = await fetch("http://localhost:8080/messages", request);
        const data  = await response.json();

        if (data.result === "success") {
            result = "Message sent succesfully";
        }

        else {
            result = "An error occured";
        }
        
        textFieldOpen = false;

    }
</script>
<h1>This is a public profile for {userId}</h1>
<button on:click={writeMessage}>Send a private message</button>

{#if textFieldOpen}
<label for="message-text">Write your message here:</label><br>
<textarea id="message-text" cols="30" rows="10" bind:value={messageText}></textarea><br>
<button on:click={sendMessage}>Send</button>
{/if}

{#if result}
<p>{result}</p>
{/if}