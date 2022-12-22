// sorting type is set to most recent by default
var sortingtype = "mrec"
// server data is not jet saved client side
var saved_server_data = "none"
// this creates the nice little toggle 
function mostrecent(){
    document.getElementById("mostrecent").style = "background-color: #3cdfff; width: 50%; float: left; color:white;"
    document.getElementById("mostpopular").style = "background-color: #010845; width: 50%; float: left; display:inline; color:white;"
    sortingtype = "mrec"
}
function mostpopular(){
    document.getElementById("mostpopular").style = "background-color: #3cdfff; width: 50%; float: left; color:white;"
    document.getElementById("mostrecent").style = "background-color: #010845; width: 50%; float: left; display:inline; color:white;"
    sortingtype = "mpop"
}

async function receiveserver(){
    // receiveserver checks if posts are stored client side 
    //if not it will fetch the posts and store it in the saved_server_data var
    if (saved_server_data== "none"){
        const response = await fetch("/.netlify/functions/index/entrys")
        const data = await response.json()
        saved_server_data = data
        var sd = data
    }
    // if stored use the stored data
    if (saved_server_data != "none"){
        var sd = saved_server_data
    }
    return sd
}


function getposts(sortingtype) {
    // this checks wich sorting type is specified 
    // and sortes the data in the that way
    async function fetcher(){
        document.getElementById("posts_row").remove()
        var new_div = document.createElement("div")
        new_div.id = "posts_row"
        new_div.className = "row"
        document.getElementById("minain").appendChild(new_div)
        var sorted = ""
        const data = await receiveserver()
        if (sortingtype === "mrec"){
            sorted = data.sort(function(x, y){
                return y.timestamp - x.timestamp;
            })
        }

        if (sortingtype === "mpop"){
            sorted = data.sort(function(x, y){
                return y.boosts - x.boosts;
            })
        }
        // all the heay lifting is done by the postbuilder (look at /index.js)
        console.log(sorted)
        postbuilder(sorted,"posts_row")

    }
    fetcher()
}
getposts(sortingtype)