<script>
import { Link } from 'svelte-navigator';
import { onMount } from "svelte";
import { useNavigate } from "svelte-navigator";
import { postStore } from "../stores.js";
import { userStore } from "../stores.js";
import { sortPosts } from '../components/sortingFunction'


const navigate = useNavigate();   
let posts = [];
let pageToFetch = 1;
let user = {};
let currentPostSorting = "byDate"
let topPicture = "fresh.gif"
let headerTitle = "Fresh post" 
userStore.subscribe((value) => user = value);


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
          topPicture = "fresh.gif"
          headerTitle = "Freshest posts"  
        }    
  } 
  
  catch(err) {
    console.log(err.message)
  }   
}


// Increments or decrements Like from Post
async function likeOrUnlikePost(postId, likeOrUnlike = "") {

  try {
       
      bindLikeToUser(postId, likeOrUnlike) 
  
      const url = "http://localhost:8080/like/" + likeOrUnlike + postId;
      const response = await fetch(url);
      const data = await response.json();

      if (data.result === "success") {
        if (currentPostSorting == "byDate") { fetchPosts() } 
        else if (currentPostSorting == "byLikes") { sortByLikes() }
        else { sortByComments() }  
      }

  } catch(err) {
      console.log(err.message)
    }
}


// Add or removes Like from User
async function bindLikeToUser(postId, likeOrUnlike = "") {

  try {
    const request = {
      method : "POST",
      headers : {
          "Content-Type": "application/json"
    },
      body : JSON.stringify({userId : user.userId, postId : postId})
    }
    const response = await fetch("http://localhost:8080/like/" + likeOrUnlike + "post-to-user", request);
    const data = await response.json();   

  }

  catch(err) {
      console.log(err.message)
    }  
  
}


// Sorting options
async function sortByLikes() {
  posts = await sortPosts(posts, pageToFetch, "sortByLikes") 
  posts.unshift({id: 0}) // Post.id needs to match array index
  currentPostSorting = "byLikes"
  topPicture = "minions-thumbs-up.gif"
  headerTitle = "Favoured posts"
}

async function sortByComments() {
  posts = await sortPosts(posts, pageToFetch, "sortByComments")
  posts.unshift({id: 0}) // Post.id needs to match array index
  currentPostSorting = "byComments"
  topPicture = "activity.gif"
  headerTitle = "Most commented posts"

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
          <div class="column"><button class="button" on:click={fetchPosts}>Fresh</button></div>
          <div class="column"><button class="button" on:click={sortByLikes}>Likes</button></div>
          <div class="column"><button class="button" on:click={sortByComments}>Activity</button></div>        
        </div>      
    </div>
        
    <div class="column">
        
        <div>
          <p class="title is-1">Hottest Memes</p>
          <hr>
          <img src="images/{topPicture}" class="picture" id="fire-gif" alt="Sorting picture">
          <hr>
        </div>
        

        {#each posts as post}

        {#if post.id != 0}
        <div class="card">
            <header class="card-header">

              <p class="card-header-title" >{post.title}</p>

              <button class="card-header-icon" aria-label="more options">
                <span class="icon">

                  <p class="post-header-tag">Comments <strong >{post.comment_count}</strong></p>
                 
                  <p class="post-header-tag">Likes <strong >{post.like}</strong></p>
                  
                  {#if post.liked == 0}
                  <i class="fas fa-angle-down" aria-hidden="true" >                   
                    <button id="like-button" class="button is-info" on:click={likeOrUnlikePost(post.id)}>Like</button>
                  </i>
                  {:else}
                    <button id="unlike-button" class="button is-primary is-outlined" on:click={likeOrUnlikePost(post.id, "unlike/")}>Liked</button>
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
                
                <hr>
                
                <div class="flex-container">
                  <a id="user-tag" class="flex-item" ><em>@{post.username}</em></a>
                  <p class="flex-item">{post.date}</p>
                </div>

              </div>
            </div>
            <footer class="card-footer">
              <button class="button is-link is-rounded" style="align-item: center;" on:click={setPostInSession(post.id)}>View post</button>
            </footer>
          </div>

          <br>
        {/if}  
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
    
    <div class="column" id="sticky-column">
        <Link to="/create-post"> <p class="title is-5">Create post</p> </Link>
        <Link to="/create-post"><img class="plus_sign" src="images/plus_icon.png" style="width: 40px" alt="Plus sign"></Link>
    </div>
</div>


<style>

    .card-footer {
      justify-content: center;
    }

    .card-header-title {
      color: "blue";
    }

    .bread-text {
      color:"cornflowerblue"
    }

    #like-button {
      margin-right: 170px;
    }

    #unlike-button {
      margin-right: 180px;
    }

    #fire-gif {
      height: 10%;
    }

   
</style>



