<script>
import { useNavigate } from 'svelte-navigator';
import { loginStore } from '../stores'

const navigate = useNavigate(); 

let title = ""
let text = ""
let media = "picture"
let loggedIn;
loginStore.subscribe((value) => loggedIn = value)


if (!loggedIn) {
    navigate("/")
}


async function createPost() {
    const request = {
        method : "POST",
        headers : {
            "Content-Type": "application/json"
        },
        body : JSON.stringify({title, text, photo, video})
    }
    const response = await fetch("http://localhost:8080/post", request);

    if (response.ok) {
        navigate("/");
    }
    else {
        console.log(response.statusText);
    }
}


// UPLOAD MEDIA
let photo, video, fileinput;

const onFileSelected = (e) => {

    let image = e.target.files[0];
    let reader = new FileReader();
    reader.readAsDataURL(image);
    reader.onload = e => {
        if (media == "picture")  { 
            photo = e.target.result; 
        } 
        
        else if (media == "video")   {
            video = e.target.result;  
            // Checks video format = mp4
            let formatString = video.split(";")[0]  
            let format = formatString.split("/")[1]                                   
            if (format != "mp4") {
                video = ""
                alert("Video needs to be .MP4 formatted")
            }
            
        } 
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
                    <div class="chan" on:click={()=>{fileinput.click();}}>Choose Image </div>
                    <input style="display:none"                    
                           type="file" 
                           accept=".jpg, .jpeg, .png" on:change={(e)=> onFileSelected(e) } bind:this={fileinput} >
            
            {:else}

                {#if video}
                    <video width="320" height="240" controls>
                        <source src={video} type="video/mp4">
                        <track src="" kind="captions" srclang="en" label="english_captions">
                        Your browser does not support the video tag.
                    </video>
                {:else}
                    <img class="avatar" src="https://cdn4.iconfinder.com/data/icons/small-n-flat/24/user-alt-512.png" alt="" /> 
                {/if}
                    <img class="upload" src="images/video_icon.png" alt="" on:click={()=>{fileinput.click();}} />
                    <div class="chan" on:click={()=>{fileinput.click();}}>Choose Video (mp4)</div>
                    <input style="display:none"                    
                        type="file"
                        data-max-file-size="40MB"
                        data-max-files="1"
                        accept=".mp4"
                        on:change={(e)=>onFileSelected(e)} bind:this={fileinput} >
      
            {/if}

        </div>

        <div>
            <textarea class="textarea" placeholder="e.g. This is my post to the world" bind:value={text}></textarea>
            <button class="button is-light is-rounded" id="viewPostButton" on:click={createPost}>Submit</button>
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

