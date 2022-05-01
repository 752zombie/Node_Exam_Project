<script>
import { onMount } from "svelte";
import { loginStore, userStore, postStore } from "../stores.js";
import { useNavigate } from "svelte-navigator";

let posts = []
let user = {};
userStore.subscribe((value) => user = value);
const navigate = useNavigate(); 

onMount(fetchUserPosts)
async function fetchUserPosts() {

    try {
        const url = "http://localhost:8080/posts/user/" + user.userId;
        const response = await fetch(url);
        const data = await response.json();
        if (data.result === "success") {
            posts = data.posts;
            console.log(posts)
        }

    } catch (err) {
        console.log(err)
    }
}


async function deletePost(postId) {
    
    try {
        const url = "http://localhost:8080/post/delete/" + postId;
        const response = await fetch(url);
        const data = await response.json();
        if (data.result === "success") {
            fetchUserPosts()
        }

    } catch (err) {
        console.log(err)
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
    
    <div class="column is-8">
        <h1>Here is the username {user.username}</h1>
        <div>USER</div>
    </div>


    <div class="column">
        
        <p class="title is-6">Your post overview</p>

        <hr>

        {#each posts as post}
        <div class="card">
            <header class="card-header">
              <p class="card-header-title">
                {post.title}
              </p>

              <br>
              
              <p class="post-header-tag">Comments <strong >{post.comment_count}</strong></p>                 
              <p class="post-header-tag">Likes <strong >{post.like}</strong></p>

              <button class="card-header-icon" aria-label="more options">
                <span class="icon">
                    
                  <i class="fas fa-angle-down" aria-hidden="true"></i>
                </span>
              </button>
            </header>
            <div class="card-content">
              <div class="content">
                {post.text}

                <hr class="hr-posts-card">

                <p class="post-header-tag">{post.date}</p> 

                
              </div>
            </div>
            <footer class="card-footer">
              <button class="button is-link is-rounded" id="viewPostButton" on:click={setPostInSession(post.id)}>Open</button>              
              <button class="button is-danger is-light is-rounded" on:click={deletePost(post.id)}>Delete</button>
            </footer>
          </div>

          <br>
        {/each}  
    </div>
</div>

<style>
    .card-footer {
      justify-content: center;
      justify-content: space-around;
      border: none;
    }

    button {
      width: 120px;
    }
    
    .post-header-tag {
        text-align: center;
    }
</style>
