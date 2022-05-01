// Increments or decrements Like from Post
export async function likeUnlike(postId, userId, likeOrUnlike="") {

    try {
         
        bindLikeToUser(postId, userId, likeOrUnlike) 
    
        const url = "http://localhost:8080/like/" + likeOrUnlike + postId;
        const response = await fetch(url);
        const data = await response.json();
        return data
  
    } catch(err) {
        console.log(err.message)
      }
  }
  
  
  // Add or removes Like from User
  async function bindLikeToUser(postId, userId, likeOrUnlike="") {
  
    try {
      const request = {
        method : "POST",
        headers : {
            "Content-Type": "application/json"
      },
        body : JSON.stringify({userId : userId, postId : postId})
      }
      const response = await fetch("http://localhost:8080/like/" + likeOrUnlike + "post-to-user", request);
      const data = await response.json();   
  
    }
  
    catch(err) {
        console.log(err.message)
      }  
    
  }
  