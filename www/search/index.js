var searchtype = "user"
// this checks if the enter key is pressed
document.getElementById("search_term")
    .addEventListener("keyup", function(event) {
    event.preventDefault();
    if (event.keyCode === 13) {
        document.getElementById("GO").click();
    }
});




function change(type) {
    // this changes the DOM based on the search type
    if (type === "user"){
        console.log("user")
        document.getElementById("main").style = "height: 350px; width: 100%; background-color: #151e32; border-radius: 10px;"
        document.getElementById("headline").innerText = "Search for a User"
        document.getElementById("search_term").value = ""
        document.getElementById("404").innerText = ""
        document.getElementById("search_term").placeholder = "User ID"
        searchtype = "user"


        
    }
    if (type === "post"){
        console.log("post")
        document.getElementById("main").style = "height: 350px; width: 100%; background-color: #1f2e4b; border-radius: 10px;"
        document.getElementById("headline").innerText = "Search for a Post"
        document.getElementById("search_term").value = ""
        document.getElementById("404").innerText = ""
        document.getElementById("search_term").placeholder = "Post ID"
        searchtype = "post"

    }
    if (type === "keyword"){
        document.getElementById("main").style = "height: 350px; width: 100%; background-color: #2a3d64; border-radius: 10px;"
        document.getElementById("headline").innerText = "Search for a Keyword"
        document.getElementById("search_term").value = ""
        document.getElementById("404").innerText = ""
        document.getElementById("search_term").placeholder = 'Keyword e.g "bill","bob" ' 
        searchtype = "keyword"

    }
    if (type === "channel"){
        console.log("channel")
        document.getElementById("main").style = "height: 350px; width: 100%; background-color: #344d7d; border-radius: 10px;"
        document.getElementById("headline").innerText = "Search a Channel"
        document.getElementById("search_term").value = ""
        document.getElementById("404").innerText = ""
        document.getElementById("search_term").placeholder = "Channel"
        searchtype = "channel"


    }
}
function search(type){
    // gets value of input field, removes spaces and newlines
   var value = document.getElementById("search_term").value
   value = (value.replace(/ /g,''))
   /*
    if (value === ""){
        document.getElementById("posts_row").remove()
        document.getElementById("404").innerText = ("404 :-(")
    }
    */
    function getposts() {
        async function fetcher(){
            try{
                document.getElementById("posts_row").remove()
            }
            catch(err){
                console.log("err")
            }
            // creates a div and writes the post inside it
            var new_div = document.createElement("div")
            new_div.id = "posts_row"
            new_div.className = "row"
            document.getElementById("full_main").appendChild(new_div)
            const response = await fetch("/.netlify/functions/index/search/" + type + "/" + value)
            const data = await response.json()
            if (data.length == 0){
                document.getElementById("posts_row").remove()
                document.getElementById("404").innerText = ("404 :-(")
            }
            // sorted based on timestamp (most recent)
            const sorted = data.sort(function(x, y){
                return y.timestamp - x.timestamp;
            })
            postbuilder(sorted,"posts_row")

        }
        fetcher()
    }
    getposts()


}