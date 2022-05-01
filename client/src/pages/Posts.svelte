<script>
import { Link } from 'svelte-navigator';
import { onMount } from "svelte";
import { useNavigate } from "svelte-navigator";
import { loginStore, userStore, postStore } from "../stores.js";
import { sortPosts } from '../components/sortingFunction'
import { likeUnlike } from '../components/likes'


const navigate = useNavigate();   
let posts = [];
let pageToFetch = 1;
let user = {};
let currentPostSorting = "byDate"
let topPicture = "fresh.gif"
userStore.subscribe((value) => user = value);
let loggedIn = {}
loginStore.subscribe(value => { loggedIn = value;	});


onMount(fetchPosts);

async function fetchPosts() {

  try {
    const request = {
        method : "POST",
        headers : {
            "Content-Type": "application/json"
      },
        body : JSON.stringify({userId : user.userId, page : pageToFetch})
      }
      const response = await fetch("http://localhost:8080/posts", request);
      let data = await response.json(); 

      if (data.result === "success") {
          posts = data.posts;        
          posts.unshift({id: 0}) // Post.id needs to match array index
          currentPostSorting = "byDate"        
          topPicture = "fresh.gif" 
        }    
  } 
  
  catch(err) {
    console.log(err.message)
  }   
}


// Like or unlike function
async function likeOrUnlikePost(postId, likeOrUnlikePost="") {

let data = await likeUnlike(postId, user.userId, likeOrUnlikePost) // imported function

if (data.result === "success") {
        if (currentPostSorting == "byDate") { fetchPosts() } 
        else if (currentPostSorting == "byLikes") { sortByLikes() }
        else { sortByComments() }  
      }
}


// Sorting options
async function sortByLikes() {
  posts = await sortPosts(posts, pageToFetch, "sortByLikes") // imported function
  posts.unshift({id: 0}) // Post.id needs to match array index
  currentPostSorting = "byLikes"
  topPicture = "minions-thumbs-up.gif"
}

async function sortByComments() {
  posts = await sortPosts(posts, pageToFetch, "sortByComments") // imported function
  posts.unshift({id: 0}) // Post.id needs to match array index
  currentPostSorting = "byComments"
  topPicture = "activity.gif"
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


// Needed to fetch current Post in ViewPost  
function setPostInSession(id) {
    postStore.set(id)
    navigate("/post")
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
            <!-- svelte-ignore a11y-mouse-events-have-key-events on:mouseover={freshInfo} on:mouseleave={freshInfo} -->
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
        
    <div class="column">
        
        <div>
          <p class="title is-1">Hottest Memes</p>
          <hr>
          <!-- svelte-ignore a11y-missing-attribute -->
          <img src="images/{topPicture}" class="picture">
          <hr>
        </div>
        

        {#each posts as post}

        {#if post.id != 0}
        <div class="card">
            <header class="card-header">

              <p class="card-header-title" >{post.title}</p>

              <button class="card-header-icon" aria-label="more options">
                <span class="icon">

                  {#if loggedIn}
                  <p class="post-header-tag">Comments <strong >{post.comment_count}</strong></p>                 
                  <p class="post-header-tag">Likes <strong >{post.like}</strong></p>
                  
                  {#if post.liked == 0}
                  <i class="fas fa-angle-down" aria-hidden="true" >                   
                    <button id="like-button" class="button is-info is-light" on:click={likeOrUnlikePost(post.id)}>Like</button>
                  </i>
                  {:else}
                    <button id="unlike-button" class="button is-primary is-inverted" on:click={likeOrUnlikePost(post.id, "unlike/")}>Liked</button>
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
                {:else}
                <p></p>
                {/if}
                
                <p class="bread-text"><strong>{post.text}</strong></p>
                
                <hr class="hr-posts-card">
                
                <div class="flex-container">
                  <a id="user-tag" class="flex-item" ><em>@{post.username}</em></a>
                  <p class="flex-item">{post.date}</p>
                </div>

              </div>
            </div>
            <footer class="card-footer">
              <button class="button is-link is-rounded" id="viewPostButton" on:click={setPostInSession(post.id)}>View post</button>
            </footer>
          </div>

          <br>
        {/if}  
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
        <Link to="/create-post"> <p class="title is-5">Create post</p> </Link>
        <Link to="/create-post"><img class="plus_sign" src="images/plus_icon.png" style="width: 40px" alt="Plus sign"></Link>
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



