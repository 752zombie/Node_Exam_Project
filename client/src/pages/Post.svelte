<script>
    import { onMount } from 'svelte'

    const postId = localStorage.getItem("postId")
    onMount(fetchPost(postId))

    
    async function fetchPost(postId) {

        try { 
            const url = "http://localhost:8080/post/" + postId;
            const response = await fetch(url);
            const data = await response.json();
            console.log(data)
            console.log("data "  + data.result)
            console.log("text "  + data.post.text)

            if (data.result === "success") {
                post = data.post;
            }

        } catch(err) {
            console.log(err.message)
          }  
    }

    
  
</script>
<svelte:head>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bulma@0.9.3/css/bulma.min.css">">
</svelte:head>

<div>hello THERE ONE POST</div>