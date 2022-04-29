<script>
import { userStore } from "../stores.js";

let user = {};
userStore.subscribe((value) => user = value);

async function fetchUser() {
    const url = "http://localhost:8080/user/";
    const response = await fetch(url);
    const data = await response.json();
    if (data.result === "success") {
        courses = data.courses;
    }
}
</script>

<h1>Here is the username {user.username}</h1>
<div>USER</div>