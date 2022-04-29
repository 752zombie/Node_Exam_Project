<script>
import { useNavigate } from 'svelte-navigator';
import { getDate } from '../components/getDate';


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
        body : JSON.stringify({title, text, date, photo})
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


// UPLOAD PICTURE
let  photo, fileinput;

const onFileSelected =(e)=>{

    let image = e.target.files[0];
    let reader = new FileReader();
    reader.readAsDataURL(image);
    reader.onload = e => {
        photo = e.target.result
        };
    }

 
</script>

<svelte:head>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bulma@0.9.3/css/bulma.min.css">">
</svelte:head>

<div class="columns">
    <div class="column"></div>

    <div class="column"><p class="title">Here you can create your post</p>

        <div>
            <input class="input is-info is-rounded" type="text" placeholder="Title" bind:value={title}>
        </div>       
         
        <div id="app">
            <h1>Upload Image</h1>
          
                {#if photo}
                <img class="avatar" src="{photo}" alt="d" />
                {:else}
                <img class="avatar" src="https://cdn4.iconfinder.com/data/icons/small-n-flat/24/user-alt-512.png" alt="" /> 
                {/if}
                        <img class="upload" src="https://static.thenounproject.com/png/625182-200.png" alt="" on:click={()=>{fileinput.click();}} />
                <div class="chan" on:click={()=>{fileinput.click();}}>Choose Image</div>
                <input style="display:none" type="file" accept=".jpg, .jpeg, .png" on:change={(e)=>onFileSelected(e)} bind:this={fileinput} >
        
        </div>

        <div>
            <textarea class="textarea is-info " placeholder="e.g. This is my post to the world" bind:value={text}></textarea>
            <button class="button is-success is-light" on:click|preventDefault={createPost}>Submit</button>
        </div>    
    </div>
    
    <div class="column">

        

    </div>
</div>

<style>
	#app{
	display:flex;
		align-items:center;
		justify-content:center;
		flex-flow:column;
}
 
	.upload{
		display:flex;
	height:50px;
		width:50px;
		cursor:pointer;
	}
	.avatar{
		display:flex;
		height:200px;
		width:200px;
	}
</style>

