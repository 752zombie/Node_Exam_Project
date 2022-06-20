<script>
    import { useNavigate, useLocation } from "svelte-navigator";
    import { loginStore, userStore } from "../stores.js";
    const navigate = useNavigate();
    const location = useLocation();
    
    let usernameInput = "";
    let emailInpput = "";
    let passwordInput = "";
    let isSignUpForm = false;
    let currentError = "";

    async function signUp() {
        const request = {
            method : "POST",
            headers : {
                "Content-Type": "application/json"
            },
            body : JSON.stringify({email : emailInpput, password : passwordInput, username : usernameInput})
        }
        const response = await fetch("http://localhost:8080/sign-up", request);
        
        if (response.ok) {
            signIn()
        }

        else {
            currentError = response.statusText;
        }
    }

    async function signIn() {
        const request = {
            method : "POST",
            headers : {
                "Content-Type": "application/json"
            },
            body : JSON.stringify({email : emailInpput, password : passwordInput})
        }
        const response = await fetch("http://localhost:8080/sign-in", request);
        
        if (response.ok) {
            const data = await response.json();
            loginStore.set(true);
            userStore.set(data.user);
            sessionStorage.setItem("isLoggedIn", "true");
            const from = ($location.state && $location.state.from) || "/";
            navigate(from, { replace: true });
        }

        else {
            currentError = response.statusText;
        }
    }

    function handleKeyPress(event) {
        if (event.key == "Enter") {
            if (isSignUpForm) {
                signUp();
            }

            else {
                signIn();
            }
        }
    }


</script>
<div id="login-container">
    {#if isSignUpForm}
    <h1>Sign up</h1>
    <label for="first-name">Username: </label>
    <input type="text" name="first-name" id="first-name" bind:value={usernameInput}> <br>
    {:else}
    <h1>Sign in</h1>
    {/if}
    
    <label for="email">Email: </label>
    <input type="email" name="email" id="email" bind:value={emailInpput}> <br>
    <label for="password">Password: </label>
    <input type="password" name="password" id="password" bind:value={passwordInput}> <br>
    
    {#if isSignUpForm}
    <button class="button is-link is-rounded" id="viewPostButton" on:click={signUp}>Sign up</button><br>
    <span on:click={() => isSignUpForm = false}>Already have an account? Go to sign in</span> <br>
    {:else}
    <button class="button is-link is-rounded" id="viewPostButton" on:click={signIn}>Sign in</button><br>
    <span on:click={() => isSignUpForm = true}>Don't have an account yet? Go to sign up</span> <br>
    {/if}
    {#if currentError}
    <p id="error">Error: {currentError}</p>
    {/if}
</div>


<svelte:window on:keypress={handleKeyPress}/>

<style>
    span {
     cursor:pointer;
     color:blue;
     text-decoration:underline;
    }

    #error {
        color: red;      
    }

    #login-container {
        margin-top: 10%;
    }

    #viewPostButton {
        margin-top: 5px;
    }
</style>

