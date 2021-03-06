// Increments or decrements Like from Post
export async function likeUnlike(postId, likeOrUnlike="") {

  try {
        const request = {
          method : "POST",
          headers : {
              "Content-Type": "application/json"
          },
          body : JSON.stringify({postId : postId})
        }
        
        const url = "http://localhost:8080/" + (likeOrUnlike === "unlike" ? "unlike" : "like");
        const response = await fetch(url, request);
        return response;
      
  } catch(err) {
      console.log(err.message)
    }
}
  