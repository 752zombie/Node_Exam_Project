import { loginStore, socketStore } from "../stores.js";

let socket;
socketStore.subscribe((value) => socket = value);

async function signOut(navigate) {
    const request = {
        method : "POST"
    }
    const response = await fetch("http://localhost:8080/sign-out", request);
    const { result } = await response.json();
    if (result === "success") {
        loginStore.set(false);
        sessionStorage.removeItem("isLoggedIn");
        if (socket) {
            socket.disconnect();
        }
        navigate("/");
    }

    else {
        alert("Something went wrong");
    }
}

export default signOut;