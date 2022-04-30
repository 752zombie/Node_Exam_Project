<script>
    import { io } from "socket.io-client";
    
    import { socketStore } from "../stores.js";
    //import io from "socket.io-client"
    
    
    
        let chatInput = "";
        let userToSendTo = "";
        
        let socket;
    
        socketStore.subscribe((value) => socket = value);
    
        console.log("socket: ", socket);
    
        if (!socket.connected) {
            socketStore.set(io())
            socket.on("chat message", (data) => {
                console.log(data);
            })
    
            socket.on("connect", () => {
                console.log("connect: ", socket.id);
            })
    
            socket.on("reconnect", (attempt) => {
                console.log("reconnect: ", attempt);
            })
        }
    
    
        function sendMessage() {
            //console.log(userToSendTo);
            if (socket) {
                socket.emit("chat message", userToSendTo, chatInput);
            }
        }
    
    
    
    </script>

<h1>Messages</h1>
    
<div>
    <h1>COLOR</h1>
    <input type="text" bind:value={chatInput}>
    <input type="text" bind:value={userToSendTo}>
    
    <button on:click={sendMessage}>Add message</button>
</div>