<script>
import { onMount } from 'svelte'
import { getDate } from '../components/getDate.js'
import { postStore } from '../stores.js'
import { userStore } from '../stores.js'

let photo = ""
let post = []
let comments = []
let comment = ""
let currentError = ""
let postId = ""
postStore.subscribe((value) => postId = value)
let userId = ""
userStore.subscribe((value) => userId = value)

//onMount?
fetchPost(postId)
async function fetchPost(postId) {

  try { 
    const url = "http://localhost:8080/post/" + postId;
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.result === "success") {
        post = data.post;
        photo = post.photo
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
        body : JSON.stringify({comment : comment, date : date, postId : postId, userId : userId})
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

  
</script>


<svelte:head>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bulma@0.9.3/css/bulma.min.css">">
</svelte:head>

<div> <p class="title is-3">{post.title} </p></div>

<br>

<div><img src={photo} style="max-width: 500px;" alt=""> </div>
    
<div class="columns">

    <div class="column"></div>


    <div class="column">

        <div class="card">
            <header class="card-header">
            <p class="card-header-title">
                {post.title}
            </p>
            <button class="card-header-icon" aria-label="more options">
                <span class="icon">
                <i class="fas fa-angle-down" aria-hidden="true">
                  <button style="margin-right: 20px;" class="button is-info">Like</button>
                </i>
                </span>
            </button>
            </header>
            <div class="card-content">
            <div class="content">
                {post.text}
                <br>
            
            </div>
            </div>
            <footer class="card-footer">
                <p class="is-center"><em>{post.date}</em></p>
            </footer>
        </div>

        <br>

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



 