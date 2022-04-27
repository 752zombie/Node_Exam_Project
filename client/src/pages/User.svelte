<script>
    async function fetchUser() {
        const url = "http://localhost:8080/user/";
        const response = await fetch(url);
        const data = await response.json();
        if (data.result === "success") {
            courses = data.courses;
        }
    }
</script>

<div>USER</div>