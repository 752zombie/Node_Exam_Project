// Increments or decrements Like from Post
export async function likeUnlike(postId, userId, likeOrUnlike="") {

  try {
      let userLikeData 
      if (likeOrUnlike == "unlike") { userLikeData  = await removeLikeFromUser(postId, userId)}
      else { userLikeData = await bindLikeToUser(postId, userId) } 

      if (userLikeData.statusText == "OK") {
        const request = {
          method : "PATCH",
          headers : {
              "Content-Type": "application/json"
        },
          body : JSON.stringify({userId : userId, postId : postId})
        }
        const data = await fetch("http://localhost:8080/like/" + likeOrUnlike, request);
        return data
      }

  } catch(err) {
      console.log(err.message)
    }
}
  
// Add Like to User
async function bindLikeToUser(postId, userId) {

  try {
    const request = {
      method : "POST",
      headers : {
          "Content-Type": "application/json"
    },
      body : JSON.stringify({userId : userId, postId : postId})
    }
    const data = await fetch("http://localhost:8080/like/post-to-user", request);
    return data
  }

  catch(err) {
      console.log(err.message)
    }  
  
}

// Removes Like from User
async function removeLikeFromUser(postId, userId) {

  try {
    const request = {
      method : "DELETE",
      headers : {
          "Content-Type": "application/json"
    },
      body : JSON.stringify({userId : userId, postId : postId})
    }
    const data = await fetch("http://localhost:8080/like/unlike/post-to-user", request);
    return data
  }

  catch(err) {
      console.log(err.message)
    }  
  
}
  