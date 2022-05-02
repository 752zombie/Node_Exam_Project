<script>
    import { Link } from "svelte-navigator";
    import { loginStore, userStore } from "../stores.js";
    import signOut from "../scripts/signout.js"
    import { navigate } from "svelte-navigator";

    let isLoggedIn = false;
	let user;
    loginStore.subscribe((value) => isLoggedIn = value);
	userStore.subscribe((value) => user = value);

</script>

<nav class="link-wrapper">
    <Link to="/" class="header-link space-between first-link"><strong>ReddOt</strong><img src="images/fire_emoji.png" alt=""></Link>
    <Link to="/posts" class="header-link align-right">Posts</Link>
	<Link to="/messages" class="header-link align-left">Messages</Link>
    
    {#if !isLoggedIn}
    <Link to="login" class="header-link align-right">Sign in</Link>
	
    {:else}
    <span class="header-link align-right" on:click={() => signOut(navigate)}>Sign out</span>
	<div><Link to="user" class="header-link align-right">{user.username}</Link></div>
	<div><Link to="user"><img src="images/user_icon.png" id="userIcon" style="width: 40px; margin-left: -50%" alt="user icon"></Link></div>
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
		background-color: rgb(255,182,193);
		padding-top: 10px;
		padding-bottom: 10px;
	}

	nav :global(.header-link) {
		text-decoration: none;
		color: white;
		font-size: x-large;
        cursor: pointer;
	}

	img {
		width: 30px; 
		margin-top: 2px;
	}

	img:hover {
		opacity: 0.5;
	} 

</style>
