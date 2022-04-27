<script>
    import { Link } from 'svelte-navigator';
    import { loginStore } from "../stores.js";
    import { onMount } from "svelte";
        
    let posts = [];
    let pageToFetch = 1;
    let shortenedText;

    onMount(fetchPosts);

    async function fetchPosts() {

        try { 
            const url = "http://localhost:8080/posts/" + pageToFetch;
            const response = await fetch(url);
            const data = await response.json();

            if (data.result === "success") {
                posts = data.posts;
            }
        } catch(err) {
            console.log(err.message)
     }
        
        
    }

    function nextPage() {
        if (posts.length !== 0) {
            pageToFetch++;
            fetchPosts();
        }
    }
    function previousPage()  {
        if (pageToFetch > 1) {
            pageToFetch--;
            fetchPosts();
        }
    }


</script>

<div class="columns">
    <div class="column"></div>
   
    <div class="column">
        
        <div> <p class="title is-3">Browse hot posts here</p><img src="images/fire_emoji.png" alt="Fire emoji"></div>
        

        {#each posts as post}
        <div class="card">
            <header class="card-header">
              <p class="card-header-title">
                {post.title}
              </p>
              <button class="card-header-icon" aria-label="more options">
                <span class="icon">
                  <i class="fas fa-angle-down" aria-hidden="true"></i>
                </span>
              </button>
            </header>
            <div class="card-content">
              <div class="content">
                {post.text}
                <br>
                <p><em>{post.date}</em></p>
              </div>
            </div>
            <footer class="card-footer">
              <a href="/view-post" class="card-footer-item">View post</a>
            </footer>
          </div>
          <br>
          <br>
        {/each}

        {#if pageToFetch > 1}
            <button on:click={previousPage}>Previous page</button>
        {/if}
        {#if posts.length !== 0}
            <button on:click={nextPage}>Next page</button>
        {:else}
            <p>There are no more posts</p>
        {/if}      

    </div>
    
    <div class="column">
        <Link to="/create-post"> <p class="title is-5">Create post</p> </Link>
        <Link to="/create-post"><img src="images/plus_icon.png" style="width: 40px" alt="Plus sign"></Link>
    </div>
</div>



