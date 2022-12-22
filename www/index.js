// MOTHER of all imports!!
// this file is very important

function makeran() {
    // makes a random string
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!-_+#?=$"&{([)]}*.:;,';
    var charactersLength = characters.length;
    for ( var i = 0; i < 10; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
   }
   return result;
}

async function server_req() {
    // fetches a new ticket from the server
    const response = await fetch("/.netlify/functions/index/tickets")
    const data = await response.json()
    console.log(data)
    const ticket = data.t
    const number = data.n
    const dataset = {
        "ticket":ticket,
        "number":number
    }
    return dataset 
}

function miner(ticket) {
    // takes ticket as argument
    // ads a random strings until a SHA-256 with st_val is found
    // returns new ticket
    var st_val = "000000"
    not_found = true
    while (not_found){
        var ran_data_set = (ticket + "<>" + makeran())
        var hash = sha256(ran_data_set);
        if (hash.substring(0, st_val.length) == st_val) {
            var output = (ran_data_set)
            return output
            not_found = false
            
        }
    }
}
async function getTicket(){
    // this bundels server_req() and miner() 
    // together in one function and returns a json obj
    var server_data = await server_req()
    var mined = miner(server_data.ticket)
    var number = (server_data.number)
    var fserver = {
        "ticket":mined,
        "number":number
    }
    return fserver
}

function postbuilder(data,posts_row){
    // the post builder builds the DOM elements 
    // for the posts in /town and /search
    var i = -1
        for (item of data) {

            i++
            // get all values from server json obj
            // below code may get a litle ugly good luck !
            var user_tag = item.user_tag
            var id_hash = item.id_hash
            var content = item.content
            var post_channel = item.channel
            var boosts = item.boosts
            var post_hash = item.post_hash
            var timestamp = item.timestamp
            var image = item.image
            var str_time = (new Date(timestamp)).toUTCString()
            var ticket = item.ticket
            var display_hash = (id_hash.substring(0,13) + "..." + id_hash.substring(id_hash.length, (id_hash.length - 13)))
            var post_display_hash = (post_hash.substring(0,6) + "..." + post_hash.substring(post_hash.length, (post_hash.length - 6)))

            
            var main = document.createElement("div")
            main.className = "col-lg-6"
            main.style = "padding: 10px"
            main.id = "main " + String(i)
            document.getElementById(posts_row).appendChild(main)

            var post_div = document.createElement("div")
            post_div.className = "post_div"
            post_div.id = "post_div " + String(i) 
            document.getElementById("main " + String(i)).appendChild(post_div)

            var name_display = document.createElement("div")
            name_display.className = "name_display"
            name_display.id = "name_display " + String(i)
            document.getElementById("post_div " + String(i)).appendChild(name_display)

            
            var name = document.createElement("div")
            name.className = "name"
            name.innerText = user_tag
            document.getElementById("name_display " + String(i)).appendChild(name)

            var spacer = document.createElement("div")
            spacer.style="width: 20px; height:20px; float:left;"
            document.getElementById("post_div " + String(i)).appendChild(spacer)

            if (post_channel != "nan" && post_channel != ""){
                var channel_display = document.createElement("div")
                channel_display.className = "channel_display"
                channel_display.id = "channel_display " + String(i)
                document.getElementById("post_div " + String(i)).appendChild(channel_display)

                var channel = document.createElement("div")
                channel.className = "name"
                channel.innerText = post_channel
                document.getElementById("channel_display " + String(i)).appendChild(channel)
            }
            else{
                console.log("no channel")
            }





            

            var hash_button = document.createElement("button")
            hash_button.className = "btn"
            hash_button.style = "height: 20px; width: 76%; position: relative; top: 10px; left: 13px; background-color: #151e32; color:white;"
            hash_button.id = "hash_button " + String(i)
            hash_button.setAttribute("data-bs-toggle","collapse")
            hash_button.setAttribute("data-bs-target","#fullhash_" + String(i))
            document.getElementById("post_div " + String(i)).appendChild(hash_button)

            var hash = document.createElement("div")
            hash.className = "hash"
            hash.innerHTML = display_hash
            document.getElementById("hash_button " + String(i)).appendChild(hash)

            var bst_display_o = document.createElement("div")
            bst_display_o.style = "padding: 1px;float: right; width: 15%; position: relative; top: 13px; right: 11px;"
            bst_display_o.id="bst_display_o " + String(i)
            document.getElementById("post_div " +String(i)).appendChild(bst_display_o)

            var bst_display_m = document.createElement("div")
            bst_display_m.style ="background-color: #77c6c6; width: 100%; height: 20px; font-size: 22px; border-radius: 5px;"
            bst_display_m.id="bst_display_m " + String(i)
            document.getElementById("bst_display_o " + String(i)).appendChild(bst_display_m)

            var bst_display_i = document.createElement("div")
            bst_display_i.id = "bstdisplay_i" + String(i)
            bst_display_i.setAttribute("onclick","booster("+ String(i) + ",'" + post_hash + "')")
            bst_display_i.style = "text-align: center; position: relative; bottom: 6px; color:white;"
            bst_display_i.innerText = boosts + "^"
            document.getElementById("bst_display_m " + String(i)).appendChild(bst_display_i)

            var center_el = document.createElement("center")
            center_el.id="center__el " + String(i)
            center_el.style="position:relative; top:13px;"
            document.getElementById("post_div " + String(i)).appendChild(center_el)


            var boostbtn = document.createElement("button")
            boostbtn.id="loader_" + String(i)
            boostbtn.className = "btn"
            boostbtn.style = "display: none;"
            boostbtn.type = "button"
            document.getElementById("center__el " + String(i)).appendChild(boostbtn)

            var booststyle = document.createElement("span")
            booststyle.className = "spinner-border spinner-border-sm"
            booststyle.setAttribute("role","status")
            booststyle.setAttribute("aria-hidden","true")
            booststyle.style = "float:left;"
            document.getElementById("loader_" + String(i)).appendChild(booststyle)



           var mining_dis = document.createElement("p")
           mining_dis.innerText = "Mining..."
           mining_dis.style="position: relative; bottom:5px;"
           document.getElementById("loader_"+ String(i)).appendChild(mining_dis)






            var fullhash = document.createElement("div")
            fullhash.id = "fullhash_" + String(i)
            fullhash.className = "collapse"
            document.getElementById("post_div " + String(i)).appendChild(fullhash)
            
            var pudder = document.createElement("div")
            pudder.style = "height: 10px;"
            document.getElementById("fullhash_" + String(i)).appendChild(pudder)

            
            var fullhash_display = document.createElement("div")
            fullhash_display.className = "fullhash"
            fullhash_display.innerHTML = (id_hash.substring(0,22) + "<br>" + (id_hash.substring(22,42)) + "<br>" + id_hash.substring(42,64))
            document.getElementById("fullhash_" + String(i)).appendChild(fullhash_display)
            

            var padder = document.createElement("div")
            padder.className = "padder"
            padder.id = "padder " + String(i)
            document.getElementById("post_div " + String(i)).appendChild(padder)

            var content_display = document.createElement("div")
            content_display.className = "content-display"
            content_display.innerText = content
            document.getElementById("padder " + String(i)).appendChild(content_display)

            if(image != "none" && image != undefined){
                console.log(item)
                var center_el = document.createElement("center")
                center_el.id="center_el " + String(i)
                document.getElementById("padder " + String(i)).appendChild(center_el)

                var image_el = document.createElement("img")
                image_el.id = "display-image" + String(i)
                image_el.className = "display-image"
                image_el.setAttribute("src",image)
                document.getElementById("center_el " + String(i)).appendChild(image_el)
            }





            var fulltimestamp = document.createElement("div")
            fulltimestamp.id = "fulltimestamp_" + String(i)
            fulltimestamp.className = "collapse"
            document.getElementById("padder " + String(i)).appendChild(fulltimestamp)


            var pudder4 = document.createElement("div")
            pudder4.style = "height: 10px"
            document.getElementById("fulltimestamp_" + String(i)).appendChild(pudder4)


            var fulltimestamp_display = document.createElement("div")
            fulltimestamp_display.className = "fulltimestamp"
            fulltimestamp_display.innerHTML = str_time + "<br> Ticket: " + ticket
            document.getElementById("fulltimestamp_" + String(i)).appendChild(fulltimestamp_display)

            var pudder3 = document.createElement("div")
            pudder3.style = "height: 12px;"
            document.getElementById("padder " + String(i)).appendChild(pudder3)



            var padder2_ = document.createElement("div")
            padder2_.id = "padder2_ " + String(i)
            padder2_.style = "padding-bottom: 20px"
            document.getElementById("padder " + String(i)).appendChild(padder2_)



            var post_hash_button = document.createElement("button")
            post_hash_button.className = "btn btn-warning"
            post_hash_button.style = "height: 20px; width: 50%; position: relative; top: 10px; left: 13px; float: left;"
            post_hash_button.id = "post_hash_button " + String(i)
            post_hash_button.setAttribute("data-bs-toggle","collapse")
            post_hash_button.setAttribute("data-bs-target","#fullposthash_" + String(i))
            document.getElementById("padder2_ " + String(i)).appendChild(post_hash_button)

            var display_post_hash = document.createElement("div")
            display_post_hash.className = "hash"
            display_post_hash.innerHTML = post_display_hash
            document.getElementById("post_hash_button " + String(i)).appendChild(display_post_hash)

            


            var timestamp_button = document.createElement("button")
            timestamp_button.className = "btn"
            timestamp_button.style = "height: 20px; width: 40%; position: relative; top: 10px; left: 20px; background-color: #1f2e4b; border-radius: 5px; color: ; float: left; color:white;"
            timestamp_button.id = "timestamp_button " + String(i)
            timestamp_button.setAttribute("data-bs-toggle","collapse")
            timestamp_button.setAttribute("data-bs-target","#fulltimestamp_" + String(i))
            document.getElementById("padder2_ " + String(i)).appendChild(timestamp_button)

            var display_timestamp = document.createElement("div")
            display_timestamp.className = "hash"
            display_timestamp.innerHTML = timestamp
            document.getElementById("timestamp_button " + String(i)).appendChild(display_timestamp)





            
            var fullposthash = document.createElement("div")
            fullposthash.id = "fullposthash_" + String(i)
            fullposthash.className = "collapse"
            document.getElementById("padder " + String(i)).appendChild(fullposthash)

            
            var pudder2 = document.createElement("div")
            pudder2.style = "height: 10px;"
            document.getElementById("fullposthash_" + String(i)).appendChild(pudder2)




            var fullposthash_display = document.createElement("div")
            fullposthash_display.className = "fullhash"
            fullposthash_display.id = "fullhashpost_" + String(i)
            fullposthash_display.innerHTML = (post_hash.substring(0,22) + "<br>" + (post_hash.substring(22,42)) + "<br>" + post_hash.substring(42,64))
            document.getElementById("fullposthash_" + String(i)).appendChild(fullposthash_display)

         
           
        }


}

async function main_boost_display(post_id,num){
    // if a user boosts a post by using the boost button 
    // in the post this function will update the DOM value
    // with out needing to fetch the database again
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
    document.getElementById("loader_"+ String(num)).style ="display:none;"
    var lboost = document.getElementById("bstdisplay_i"+ String(num)).innerText
    lboost = lboost.slice(0,-1)
    lboost = (parseInt(lboost)+ 1)
    console.log(lboost)
    document.getElementById("bstdisplay_i"+ String(num)).innerText = ""
    document.getElementById("bstdisplay_i"+ String(num)).innerText = lboost + "^"

}

async function booster(num,hash){
    var loader = document.getElementById("loader_" + String(num))
    loader.style = "height: 30px; width:40%; font-size:20px; display:block; text-align: center; background-color: #77c6c6; color:white;"
    main_boost_display(hash,num)


}
