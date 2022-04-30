<script>
    import { Link } from "svelte-navigator";
    import { loginStore } from "../stores.js";
    import signOut from "../scripts/signout.js"
    import { navigate } from "svelte-navigator";

    let isLoggedIn = false;
    loginStore.subscribe((value) => isLoggedIn = value);
</script>

<nav class="link-wrapper">
    <Link to="/" class="header-link space-between first-link">Home</Link>
    <Link to="/posts" class="header-link align-right">Posts</Link>
	<Link to="/messages" class="header-link align-left">Messages</Link>
    
    {#if !isLoggedIn}
    <Link to="login" class="header-link align-right">Sign in</Link>
	
    {:else}
    <span class="header-link align-right" on:click={() => signOut(navigate)}>Sign out</span>
	<div><Link to="user" class="header-link align-right">User</Link></div>
	<div><Link to="user"><img src="images/user_icon.png" style="width: 40px; margin-left: -50%" alt="user icon"></Link></div>
    {/if}
</nav>

<style>
    nav {
		display: flex;
		justify-content: center;
	}

	nav :global(.align-right) {
		margin-right: 20px;
	}

	nav :global(.align-left) {
		margin-right: auto;
	}

	nav :global(.first-link) {
		margin-left: 10px;
		margin-right: 20px;
	}
	
	nav {
		background-color: rgb(72, 72, 199);
		padding-top: 25px;
		padding-bottom: 25px;
	}

	nav :global(.header-link) {
		text-decoration: none;
		color: white;
		font-size: x-large;
        cursor: pointer;
	}

</style>
