<script>
	import { Router, Link, Route } from "svelte-navigator";
	import Navbar from './components/Navbar.svelte'
	import Footer from './components/Footer.svelte'
	import Home from "./pages/Home.svelte";
	import Login from "./pages/Login.svelte";
	import Posts from "./pages/Posts.svelte";
	import ViewPost from "./pages/ViewPost.svelte"
	import User from './pages/User.svelte';
	import CreatePost from './pages/CreatePost.svelte';
	import Messages from "./pages/Messages.svelte";
	import PublicProfile from "./pages/PublicProfile.svelte";

</script>


<Router>
	<Navbar/>
	<main>	
			<Route path="/" component={Home} />
			<Route path="/posts" component={Posts} />
			<Route path="/post" component={ViewPost} />
			<Route path="/login" component={Login} />
			<Route path="/user" component={User} />
			<Route path="/create-post" component={CreatePost} />
			<Route path="/messages" component={Messages} />
			<Route path="/public-profile/:id" let:params>
				<PublicProfile userId={params.id}/>
			</Route>
			
	</main>
	<Footer/>
</Router>

<style>
	main {
		text-align: center;
		padding: 1em;
		max-width: 240px;
		margin: 0 auto;
	}

	@media (min-width: 640px) {
		main {
			max-width: none;
		}
	}
</style>