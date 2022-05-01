<script>
import { onMount } from 'svelte'
import { getDate } from '../components/getDate.js'
import { loginStore, userStore, postStore } from "../stores.js";
import { likeUnlike } from '../components/likes'


let post = []
let comments = []
let comment = ""
let currentError = ""
let postId = ""
postStore.subscribe((value) => postId = value)
let user = {}
userStore.subscribe((value) => user = value)
let loggedIn = {}
loginStore.subscribe(value => { loggedIn = value;	});
let currentPostSorting = "fresh"

//onMount?
fetchPost(postId)
async function fetchPost(postId) {

  try { 
    const url = "http://localhost:8080/post/" + postId;
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.result === "success") {
        post = data.post;
    }

    } catch(err) {
        console.log(err)
      }  
}


fetchComments(postId)
async function fetchComments(postId) {

    try { 
        const url = "http://localhost:8080/comments/" + postId;
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.result === "success") {
            comments = data.comments;
        }

    } catch(err) {
        console.log(err)
    }  
}


async function postComment() {
    
    const date = getDate()

    const request = {
        method : "POST",
        headers : {
            "Content-Type": "application/json"
        },
        body : JSON.stringify({comment : comment, date : date, postId : postId, userId : user.userId})
    }
    const response = await fetch("http://localhost:8080/comment", request);
    const data = await response.json();
    if (data.result === "success") {
        comment = ""
        fetchPost(postId)
        fetchComments(postId)
    }
    else {
        currentError = data.result;
    }
}


// Like or unlike function
async function likeOrUnlikePost(postId, likeOrUnlikePost="") {

  let data = await likeUnlike(postId, user.userId, likeOrUnlikePost) // imported function

  if (data.result === "success") {
          console.log("successsss")
          fetchPost(postId) 
        }
}

  
</script>


<svelte:head>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bulma@0.9.3/css/bulma.min.css">
  <link rel="stylesheet" href="css/style.css">
</svelte:head>

<br>
    
<div class="columns">

    <div class="column"></div>


    <div class="column">

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
                <button id="like-button" class="button is-info" on:click={likeOrUnlikePost(post.id)}>Like</button>
              </i>
              {:else}
                <button id="unlike-button" class="button is-primary is-outlined" on:click={likeOrUnlikePost(post.id, "unlike/")}>Liked</button>
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
            
            <hr>
            
            <div class="flex-container">
              <a id="user-tag" class="flex-item" ><em>@{post.username}</em></a>
              <p class="flex-item">{post.date}</p>
            </div>

          </div>
        </div>
        <footer class="card-footer">
        </footer>
      </div>

      <br>

        <br>
                                      <!-- Comment section -->
        <div class="comment">
            <textarea class="textarea" placeholder="What are your thoughts?" bind:value={comment}></textarea>

            <button class="button is-success is-outlined" on:click={postComment}>Submit</button>
        </div>

        <br>

        <div class="comment-section">
            {#each comments as comment}
            
            <hr>

            <article class="media">
                <figure class="media-left">
                  <p class="image is-64x64">
                    <img src="https://bulma.io/images/placeholders/128x128.png" alt="Bulma">
                  </p>
                </figure>
                <div class="media-content">
                  <div class="content">
                    <p>
                      <strong>{comment.username}</strong> <small>{comment.date}</small> 
                      <br>
                      {comment.comment}
                    </p>
                  </div>
                  <nav class="level is-mobile">
                    <div class="level-left">
                      <a class="level-item" href="/#">
                        <span class="icon is-small"><i class="fas fa-reply"></i></span>
                      </a>
                      <a class="level-item" href="/#">
                        <span class="icon is-small"><i class="fas fa-retweet"></i></span>
                      </a>
                      <a class="level-item" href="/#">
                        <span class="icon is-small"><i class="fas fa-heart"></i></span>
                      </a>
                    </div>
                  </nav>
                </div>
                <div class="media-right">
                  <button class="delete"></button>
                </div>
              </article>

              <hr>
            {/each}
        </div>

    </div>


    <div class="column"></div>

</div>



 