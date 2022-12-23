function changetown(){
    window.location.replace("/town/index.html")
}
function checkURL(url) {
    return(url.match(/\.(jpeg|jpg|gif|png)$/) != null);
}
const image_input = document.querySelector("#image_url");
image_input.addEventListener("change", function() {
    var center_el = document.getElementById("mainbox").remove()
    var mainbox = document.createElement("center");
    mainbox.id = "mainbox";
    document.getElementById("notmain").appendChild(mainbox);
    var image = document.getElementById("image_url").value;
    var img_el = document.createElement("img")
    img_el.src = image;
    img_el.style = "width: 83%;height: 350px;border-radius: 5px;border: 1px solid black;"
    document.getElementById("mainbox").appendChild(img_el);
});

async function main_post(user_tag,passwd,content,channel,image){
    var mined = await getTicket()
    async function post(){
        // this is the most imortant command, 
        // because it creates the ID hash!
        var id_hash = (sha256(user_tag +"/"+ passwd))
        channel = channel.trim()
        if (channel === ""){
            channel = "nan"
        }
        // makes a json obj
        var finale = {
            "user_tag":user_tag,
            "id_hash":id_hash,
            "content":content,
            "channel":channel,
            "ticket":mined.ticket,
            "number":mined.number,
            "image":image,
        }
        console.log(finale)
        const options = {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(finale)
        }
        // sends post to server
        var x = await fetch("/.netlify/functions/index/posts", options)
        // if the status code is 200 (success)
        // it will rederect to /town
        if (x.status == 200){
            changetown()
        }
    }
    post()

}
async function main_boost(post_id){
    // this sends a boost to the server
    var mined = await getTicket()
    var finale = {
        "post_id":post_id,
        "ticket":mined.ticket,
        "ticket_number":mined.number
    }
    const options = {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(finale)
    }
    fetch("/.netlify/functions/index/boosts", options)
    var loader2 = document.getElementById("loader2").style ="display:none;"

}
function user_post() {
    // this function gets triggerd if the post button is pressed
    var name = document.getElementById("user_tag").value;
    var passwd = document.getElementById("passwd").value;
    var content = document.getElementById("content").value;
    var channel = document.getElementById("channel").value;
    var image = document.getElementById("image_url").value;
    if (image == "" || checkURL(image) == false || image.startsWith("https://") == false){
        image = "none"
    }
        var loader = document.getElementById("loader").style="width:100%; display:block;"
        main_post(name,passwd,content,channel,image)
}


function user_boost(){
    // this function gets triggerd if the boost button is pressed
    var loader2 = document.getElementById("loader2").style="width:100%; display:block;"
    var post_id = document.getElementById("post_id").value
    document.getElementById("post_id").value = ""
    post_id = (post_id.replace(/ /g,''))
    main_boost(post_id)

}

