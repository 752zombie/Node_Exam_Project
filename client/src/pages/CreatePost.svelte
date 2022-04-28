<script>
    import { useNavigate } from 'svelte-navigator';
    import { getDate } from '../components/getDate'
    
    const navigate = useNavigate(); 

    let currentError = ""
    let title = ""
    let text = ""

    async function createPost() {
        
        const date = getDate()

        const request = {
            method : "POST",
            headers : {
                "Content-Type": "application/json"
            },
            body : JSON.stringify({title, text, date})
        }
        const response = await fetch("http://localhost:8080/post", request);
        const data = await response.json();
        if (data.result === "success") {
            navigate("/posts");
        }
        else {
            currentError = data.result;
        }
    }
 
</script>

<svelte:head>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bulma@0.9.3/css/bulma.min.css">">
</svelte:head>

<div class="columns">
    <div class="column"></div>

    <div class="column"><p class="title">Here you can create your post</p>
         <input class="input is-info is-rounded" type="text" placeholder="Title" bind:value={title}>
         <textarea class="textarea is-info " placeholder="e.g. Hello Everyone" bind:value={text}></textarea>
         <button class="button is-success is-light" on:click|preventDefault={createPost}>Submit</button>
    </div>
    
    <div class="column"></div>
</div>

