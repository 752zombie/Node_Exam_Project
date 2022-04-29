<script>
import { Link } from 'svelte-navigator';
import { loginStore } from "../stores.js";
import { onMount } from "svelte";
import { useNavigate } from "svelte-navigator";
import { postStore } from "../stores.js";
import { userStore } from "../stores.js";


const navigate = useNavigate();   
let posts = [];
let pageToFetch = 1;
let user = {};
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
          console.log(posts)
          }    
  } 
  catch(err) {
    console.log(err.message)
  }   

}


// Sums number of likes on Post
async function likePost(postId) {

  try { 
      bindLikeToUser(postId)
      const url = "http://localhost:8080/like/" + postId;
      const response = await fetch(url);
      const data = await response.json();

      if (data.result === "success") {
          posts[postId-1].like += 1 // Needs to be -1 since array starts at index 0
          posts[postId-1].liked = 1
      }

  } catch(err) {
      console.log(err.message)
    }
}


// Attaches new Like to user_id
async function bindLikeToUser(postId) {

    const request = {
      method : "POST",
      headers : {
          "Content-Type": "application/json"
    },
      body : JSON.stringify({userId : user.userId, postId : postId})
    }
    const response = await fetch("http://localhost:8080/like/post-to-user", request);
    const data = await response.json();   
    
}


// Remove User's Like from Post
async function unlikePost(postId) {

  try { 
      unbindLikeToUser(postId)
      const url = "http://localhost:8080/like/unlike/" + postId;
      const response = await fetch(url);
      const data = await response.json();

      if (data.result === "success") {
          posts[postId-1].like -= 1 // Needs to be -1 since Posts array starts at index 0
          posts[postId-1].liked = 0
      }

  } catch(err) {
      console.log(err.message)
    }
}


// Attaches new Like to user_id
async function unbindLikeToUser(postId) {

  const request = {
    method : "POST",
    headers : {
        "Content-Type": "application/json"
  },
    body : JSON.stringify({userId : user.userId, postId : postId})
  }
  const response = await fetch("http://localhost:8080/like/unlike/post-to-user", request);
  const data = await response.json();   
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

    <div class="column"></div>
        
    <div class="column">
        
        <div>
          <p class="title is-1">Hottest posts</p>
          <hr>
          <img src="images/fire-gif.gif" id="fire-gif" alt="Fire emoji">
          <hr>
        </div>
        

        {#each posts as post}
        <div class="card">
            <header class="card-header">

              <p class="card-header-title" >{post.title}</p>

              <button class="card-header-icon" aria-label="more options">
                <span class="icon">

                  <p class="post-header-tag">Comments <strong >{post.comment_count}</strong></p>
                 
                  <p class="post-header-tag">Likes <strong >{post.like}</strong></p>
                  
                  {#if post.liked == 0}
                  <i class="fas fa-angle-down" aria-hidden="true" >                   
                    <button id="like-button" class="button is-info" on:click={likePost(post.id)}>Like</button>
                  </i>
                  {:else}
                    <button id="unlike-button" class="button is-primary is-outlined" on:click={unlikePost(post.id)}>Liked</button>
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
                <br>

                <p><em>{post.date}</em></p>

              </div>
            </div>
            <footer class="card-footer">
              <button class="button is-link is-rounded" style="align-item: center;" on:click={setPostInSession(post.id)}>View post</button>
            </footer>
          </div>

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
        <Link to="/create-post"><img id="plus_sign" src="images/plus_icon.png" style="width: 40px" alt="Plus sign"></Link>
    </div>
</div>


<style>

    #plus_sign {
        transition: transform .8s ease-in-out;  
    }

    #plus_sign:hover {
      transform:rotate(360deg); 
    }

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



