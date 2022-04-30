 // Sort by likes
 export async function sortPosts(posts, pageToFetch, sortOrder) {

    try {
        const request = {
            method : "POST",
            headers : {
                "Content-Type": "application/json"
          },
            body : JSON.stringify({sortOrder : sortOrder, page : pageToFetch})
          }
          const response = await fetch("http://localhost:8080/posts/sort", request);
          let data = await response.json(); 
    
          if (data.result === "success") {
              posts = data.posts;             
              }

        return posts
        
        } 
      
    catch(err) {
        console.log(err.message)
        return { message : "Error sorting posts"}
      }   
}
