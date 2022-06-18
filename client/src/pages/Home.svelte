<script>
    import { Link } from 'svelte-navigator';
    import { onMount } from "svelte";
    import { useNavigate } from "svelte-navigator";
    import { loginStore } from "../stores.js";
    import { sortPosts } from '../components/sortingFunction'
    import { likeUnlike } from '../components/likes'
    
    onMount(fetchPosts);

    const navigate = useNavigate();
      
    let posts = [];
    let pageToFetch = 1;
    let currentPostSorting = "byDate"
    let topPicture = "fresh.gif"
    
    let loggedIn;
    loginStore.subscribe(value => { loggedIn = value;	});
    

    async function fetchPosts() {
    
      try {
          const response = await fetch("http://localhost:8080/posts/" + pageToFetch);
          let data = await response.json(); 
    
          if (data.result === "success") {
              posts = data.posts;        
              currentPostSorting = "byDate"        
              topPicture = "fresh.gif"
            }    
      } 
      
      catch(err) {
        console.log(err.message)
      }   
    }
    
      
    // Sorting options
    async function sortByLikes() {
      posts = await sortPosts(posts, pageToFetch, "sortByLikes") // imported function
      currentPostSorting = "byLikes"
      topPicture = "minions-thumbs-up.gif"
    }
    
    async function sortByComments() {
      posts = await sortPosts(posts, pageToFetch, "sortByComments") // imported function
      currentPostSorting = "byComments"
      topPicture = "activity.gif"
    }
    

    // Like or unlike function
    async function toggleLike(postId, likeOrUnlikePost="") {
      
      try {
        const data = await likeUnlike(postId, likeOrUnlikePost) // imported function
    
        if (data.statusText == "OK") {
          if (currentPostSorting == "byDate") { fetchPosts() } 
          else if (currentPostSorting == "byLikes") { sortByLikes() }
          else { sortByComments() } 
        }  
      
      } catch (error) {
        console.log(error)
      }
     
    }

    
    // Pagination
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

    
    function goToProfile(id) {
      navigate("/public-profile/" + id);
    }
    
</script>
    
    
    <svelte:head>
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bulma@0.9.3/css/bulma.min.css">
      <link rel="stylesheet" href="css/style.css">
    </svelte:head>
    
    
    <div class="columns">
    
        <div class="column" id="sticky-column">
    
          <p class="title is-5">Sort your search</p>
            <div class="columns">
              <div class="column">   
                <button class="button" id="freshInfoButton" on:click={fetchPosts}>Fresh</button>
                <p class="freshSortinfo">Sort by date</p>
              </div>
              <div class="column">
                <button class="button" id="likeInfoButton" on:click={sortByLikes}>Likes</button>
                <p class="likeSortInfo">Sort by likes</p>
              </div>
              <div class="column">
                <button class="button" id="activityInfoButton" on:click={sortByComments}>Activity</button>
                <p class="activitySortInfo">Sort by comments</p>
              </div>        
            </div>      
        </div>
            
        <div class="column is-two-fifths">
            
            <div>
              <p class="title is-1">Hottest Memes</p>
              <hr>
              <!-- svelte-ignore a11y-missing-attribute -->
              <img src="images/{topPicture}" class="picture">
              <hr>
            </div>
            
    
            {#each posts as post}
    
            <div class="card">
                <header class="card-header">
    
                  <p class="card-header-title" >{post.title}</p>
    
                  <button class="card-header-icon" aria-label="more options">
                    <span class="icon">
    
                      {#if loggedIn}
                      <p class="post-header-tag">Comments <strong >{post.comment_count + post.reply_count}</strong></p>                 
                      <p class="post-header-tag">Likes <strong >{post.like}</strong></p>
                      
                      {#if post.liked == 0}
                      <i class="fas fa-angle-down" aria-hidden="true" >                   
                        <button id="like-button" class="button is-info is-light" on:click={toggleLike(post.id)}>Like</button>
                      </i>
                      {:else}
                        <button id="unlike-button" class="button is-primary is-inverted" on:click={toggleLike(post.id, "unlike")}>Liked</button>
                      {/if}  
                      {/if}
                      
                    </span>
                  </button>
    
                </header>
    
                <div class="card-content">
                  <div class="content">
    
                    {#if post.photo}
                      <p><img src={post.photo} alt=""></p>
                    
                      <hr>
    
                    {:else if post.video}               
                      <video width="520" height="340" controls>
                          <source src={post.video} type="video/mp4">
                          <track src="" kind="captions" srclang="en" label="english_captions">
                          Your browser does not support the video tag.
                      </video>
    
                      <hr>
    
                    {:else}
                      <p></p>
                    {/if}
                    
                    <p class="bread-text"><strong>{post.text}</strong></p>
                    
                    <hr class="hr-posts-card">
                    
                    <div class="flex-container">
                      <a id="user-tag" class="flex-item" on:click={() => goToProfile(post.user_id)}><em>@{post.username}</em></a>
                      <p class="flex-item">{post.date}</p>
                    </div>
    
                  </div>
                </div>
                <footer class="card-footer">
                  <button class="button is-link is-rounded" id="viewPostButton" on:click={() => navigate("/post/" + post.id)}>View post</button>
                </footer>
              </div>
    
              <br>  
            {/each}
    
        <div class="pagination">
              {#if pageToFetch > 1}
                  <button class="button" on:click={previousPage}>Previous page</button>
              {/if}
              {#if posts.length !== 0}
                  <button class="button" on:click={nextPage}>Next page</button>
              {:else}
                  <p>There are no more posts</p>
              {/if} 
            </div>     
    
        </div>
        
        
        <div class="column" id="sticky-column">
          {#if loggedIn}
            
            <Link to="/create-post">
              <p class="title is-5" id="createPostTag">Create post</p>
              <img class="plus_sign" src="images/plus_icon.png" style="width: 40px" alt="Plus sign">
            </Link>
          {:else}
          <p> Login to create your own posts</p>
          {/if}
        </div>
       
    </div>
    
    
    <style>
        
        .card-footer {
          justify-content: center;
          border: none;
        }
    
        .card-header-title {
          color: "blue";
        }
    
        .bread-text {
          color:"cornflowerblue"
        }
    
        .pagination {
          margin-bottom: 50px;
          justify-content: center;
          justify-content: space-around;
        }
    
    
    
    </style>