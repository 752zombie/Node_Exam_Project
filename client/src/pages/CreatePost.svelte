

<script>
import { useNavigate } from 'svelte-navigator';
import { getDate } from '../components/getDate';
import { userStore } from '../stores'


const navigate = useNavigate(); 
let currentError = ""
let title = ""
let text = ""
let media = "picture"
let user = []
userStore.subscribe((value) => user = value)


if (!user.username) {
    navigate("/")
}


async function createPost() {
    
    const date = getDate()

    const request = {
        method : "POST",
        headers : {
            "Content-Type": "application/json"
        },
        body : JSON.stringify({title, text, date, photo, video})
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


// UPLOAD MEDIA
let photo, video, fileinput;

const onFileSelected = (e) => {

    let image = e.target.files[0];
    let reader = new FileReader();
    reader.readAsDataURL(image);
    reader.onload = e => {
        if (media == "picture") { photo = e.target.result }
        if (media == "video")   { video = e.target.result }     
        };
    }


 
</script>

<svelte:head>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bulma@0.9.3/css/bulma.min.css">
  <link rel="stylesheet" href="css/style.css">
</svelte:head>





<div class="columns">

    <div class="column"></div>

    <div class="column">
        
        <p class="title">Here you can create your post</p>
       
        <div>
            <input class="input is-rounded" type="text" maxlength="30" placeholder="Title" bind:value={title}>
        </div>    
        
        <br>
         
        <div id="app">

            <h1><strong>Upload Media </strong> (Optional)</h1>

            <div class="flex-container"> 
                <label class="flex-item-radio">
                    <input type=radio bind:group={media} value={"picture"}>
                    Picture/Gif
                </label>
                
                <label class="flex-item-radio">
                    <input type=radio bind:group={media} value={"video"}>
                    Video
                </label>
            </div>

            {#if media == "picture"}
 
                {#if photo}
                     <img class="avatar" src="{photo}" alt="d" />
                {:else}
                     <img class="avatar" src="https://cdn4.iconfinder.com/data/icons/small-n-flat/24/user-alt-512.png" alt="" /> 
                {/if}
                    <img class="upload" src="images/picture_icon.png" alt="" on:click={()=>{fileinput.click();}} />
                    <div class="chan" on:click={()=>{fileinput.click();}}>Choose Image</div>
                    <input style="display:none"                    
                           type="file" 
                           accept=".jpg, .jpeg, .png" on:change={(e)=> onFileSelected(e) } bind:this={fileinput} >
            
            {:else}

                {#if video}
                    <video width="320" height="240" controls>
                        <source src={video} type="video/mp4">
                        <source src="movie.ogg" type="video/ogg">
                        <track src="" kind="captions" srclang="en" label="english_captions">
                        Your browser does not support the video tag.
                    </video>
                {:else}
                    <img class="avatar" src="https://cdn4.iconfinder.com/data/icons/small-n-flat/24/user-alt-512.png" alt="" /> 
                {/if}
                    <img class="upload" src="images/video_icon.png" alt="" on:click={()=>{fileinput.click();}} />
                    <div class="chan" on:click={()=>{fileinput.click();}}>Choose Video</div>
                    <input style="display:none"                    
                        type="file"
                        data-max-file-size="50MB"
                        data-max-files="1"
                        on:change={(e)=>onFileSelected(e)} bind:this={fileinput} >
      
            {/if}

        </div>

        <div>
            <textarea class="textarea" placeholder="e.g. This is my post to the world" bind:value={text}></textarea>
            <button class="button is-light is-rounded" id="viewPostButton" on:click|preventDefault={createPost}>Submit</button>
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
    
    #viewPostButton {
    margin-top: 5px;
  }
</style>

