<script>
import { onMount } from 'svelte'
import { loginStore } from "../stores.js";
import { likeUnlike } from '../components/likes'
import { navigate } from 'svelte-navigator';

export let postId;


let post = {};
let comments = [];
let commentInput = "";
let replies = [];
let replyInput = "";

let loggedIn;
loginStore.subscribe(value => { loggedIn = value;	});


onMount(() => {
    fetchPost(postId);
    fetchComments(postId);
    fetchReplies(postId);
})


async function fetchPost(postId) {

  try { 
    const url = "http://localhost:8080/post/" + postId;
    const response = await fetch(url);
    
    if (response.ok) {
        const data = await response.json();
        post = data.post;
    }

    } catch(err) {
        console.log(err)
      }  
}


async function fetchComments(postId) {

    try { 
        const url = "http://localhost:8080/comments/" + postId;
        const response = await fetch(url);
        
        if (response.ok) {
            const data = await response.json();
            comments = data.comments;
        }

    } catch(err) {
        console.log(err)
    }  
}


async function fetchReplies(postId) {
  
  try { 
    const url = "http://localhost:8080/comment/replies/" + postId;
    const response = await fetch(url);

    if (response.ok) {
        const data = await response.json();
        replies = data.replies;
    }

    } catch(err) {
        console.log(err)
      }  
}


async function postComment() {
    const request = {
        method : "POST",
        headers : {
            "Content-Type": "application/json"
        },
        body : JSON.stringify({comment : commentInput, postId : postId})
    }
    const response = await fetch("http://localhost:8080/comment", request);
    
    if (response.ok) {
        commentInput = ""
        fetchPost(postId)
        fetchComments(postId)
    }
    else {
        console.log("Error posting comment");
    }
}


async function postReply(commentId) {

  const request = {
      method : "POST",
      headers : {
          "Content-Type": "application/json"
      },
      body : JSON.stringify({reply : replyInput, commentId : commentId})
  }
  const response = await fetch("http://localhost:8080/comment/reply", request);

  if (response.ok) {
      replyInput = ""
      await fetchPost(postId)
      await fetchReplies(postId)
      await fetchComments(postId)
      
  }
  else {
      console.log("Error replying");
  }
}


async function likeOrUnlikePost(postId, likeOrUnlikePost="") {
    
    const response = await likeUnlike(postId, likeOrUnlikePost) // imported function

    if (response.ok) {
        fetchPost(postId) 
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

<svelte:window/>

<br>
    
<div class="columns mb-6">

    <div class="column"></div>

    <div class="column">

      <div class="card">
        <header class="card-header">

          <h1 class="card-header-title" >{post.title}</h1>

          <button class="card-header-icon" aria-label="more options">
            <span class="icon">

              
              <p class="post-header-tag">Comments <strong >{post.comment_count + post.reply_count}</strong></p>                 
              <p class="post-header-tag">Likes <strong >{post.like}</strong></p>
              
              {#if loggedIn && post.liked == 0}
              <i class="fas fa-angle-down" aria-hidden="true" >                   
                <button id="like-button" class="button is-info is-light" on:click={() => likeOrUnlikePost(post.id)}>Like</button>
              </i>
              {:else if loggedIn}
                <button id="unlike-button" class="button is-primary is-inverted" on:click={() => likeOrUnlikePost(post.id, "unlike")}>Liked</button>
              {:else}
              <i class="fas fa-angle-down" aria-hidden="true" >                   
                <button id="like-button" class="button is-info is-light" on:click={() => navigate("/login")}>Like</button>
              </i>
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
            
            <hr>
            
            <div class="flex-container">
              <a id="user-tag" class="flex-item" on:click={() => goToProfile(post.user_id)}><em>@{post.username}</em></a>
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
        
        {#if loggedIn}
        <div class="comment"> 
            <textarea class="textarea" id="textarea-mb" placeholder="Write a comment" bind:value={commentInput}></textarea>

            <button class="button is-link is-rounded" id="viewPostButton" on:click={postComment}>Submit</button>
        </div>
        {/if}

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
                    
                      <div class="flex-container"> 
                        <a class="flex-item" id="reply-author" on:click={() => goToProfile(comment.user_id)}><em>@{comment.username}</em></a>
                        <p class="flex-item"><small>{comment.date}</small> </p>
                      </div>                                         
                      <br>
                      <strong>{comment.comment}</strong>
                         
                    
                  </div>                  
                </div>                        
              </article>

            <hr class="hr-posts-card">

                                                <!-- REPLY section -->
            <div class="reply-container">
              {#if loggedIn}
                <div class="flex-container" id="flex-container-mb">
                  <input class="flex-item input is-rounded" type="text" placeholder="Write a reply" bind:value={replyInput}>
                  <button class="flex-item button is-link is-rounded" id="viewPostButton" on:click={() => postReply(comment.comment_id)}>Submit</button>
                </div>
              {/if}
              {#each replies as reply}
              {#if reply.comment_id == comment.comment_id}
                <div id="reply-container">
                  <div class="flex-container">
                    <a class="flex-item" id="reply-author" on:click={() => goToProfile(reply.user_id)}><em>@{reply.username}</em></a>
                    <p class="flex-item"><small>{reply.date}</small> </p>
                   </div>
                  {#if reply.reply.length > 54}     
                    <textarea class="textarea" id="old-comment" rows="2" readonly>{reply.reply}</textarea>
                  {:else}
                  <textarea class="textarea" id="old-comment" rows="1" readonly>{reply.reply}</textarea>
                  {/if}
                </div>
              {/if}
              {/each}
                          
            </div>  
           
            {/each}
        </div>
              
    </div>


    <div class="column"></div>

</div>

<style>
  #flex-container-mb {
    margin-bottom: 15px;
  }

  #textarea-mb {
    margin-bottom: 5px;
    overflow-y: hidden
  }

  .flex-container {
    display: flex;
    justify-content: space-around;
}


.flex-item {
    flex-direction: row;
}


#user-tag {
    color: purple;
    opacity : 0.5;
    transition-duration: 0.5s;
}
#user-tag:hover {
    transform: scale(1.3);
    opacity : 1;
    transition-duration: 0.5s;  
}


#like-button {
    width: 72px;
    margin-right: 180px;
    
}

#unlike-button {
    margin-right: 180px;
}

  #viewPostButton {
    background-color: rgb(255,182,193);
    color: white;
    margin-bottom: 5px;
}


  #viewPostButton:hover {
    opacity: 0.7;
    transition-duration: 0.5s;
}

.hr-posts-card {
    margin: 2px;
}

.card-content {
    padding-bottom: 5px;
    word-break: break-all;
}


.reply-container {
    margin-left: 18%;
}

#old-comment {
    background-color: rgb(255,182,193);
    resize: none;
    border-radius: 18px;
    color: white;    
}

#old-comment:focus {
    outline-width: 0;
}

#reply-author {
    text-align: left;
}

#reply-author {
    color: purple;
    opacity : 0.5;
    transition-duration: 0.5s;

}

#reply-author:hover {
    transform: scale(1.3);
    opacity : 1;
    transition-duration: 0.5s;
 
}

.columns {
    margin-bottom: 40px;
}

#reply-container {
    margin-bottom: 15px; 
}

p {
  color: blue;
}

.card-header-title {
  font-size: 25px;
}

.post-header-tag {
    margin-right: 20px
}

</style>

 