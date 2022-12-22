// import all modules
const express = require("express")
const crypto = require("crypto")
const { MongoClient } = require("mongodb")
const uri = process.env.USER_KEY;
const database_info = process.env.DB_I;
const client = new MongoClient(uri);
const serverless = require("serverless-http");
// set basic server options
const app = express()
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
const router = express.Router();
// create and load database
// global vars for funtion cleaner()
function round(value, precision) {
    var multiplier = Math.pow(10, precision || 0);
    return Math.round(value * multiplier) / multiplier;
}

async function write(client, newListing){
    const result = await client.db(database_info).collection("data").insertOne(newListing);
    return true
}

async function write_ticket(client, newListing){
    const result = await client.db(database_info).collection("tickets").insertOne(newListing);
    return true
}

async function read(client,col){
    const result = await client.db(database_info).collection(col).find({}).toArray();
    return result
}

async function remove(client,num) {
    const result = await client.db(database_info).collection("tickets").deleteMany({"n": {$lt : num}});
    console.log(result)
    return result
}


async function ticketer() {
    var tickets = read(client,"tickets")
    return tickets
}


async function combiner() {

        // combines posts and boosts, returns full database
                var data = await read(client,"data")
                var all_posts = []
                var boosts = []
                var posts = []
                // separate posts and boosts
                for (item of data){
                    if ("post_id" in item){
                        boosts.push(item)
                    }
                    if ("id_hash" in item){
                        posts.push(item)
                    }
                }
                // combine boosts with post
                var boosts_hashes = [boosts.map(item => item.post_id)];
                for (post of posts){
                    var bsts = 0 
                   for (boost_hash of boosts_hashes[0]){
                        if (post.post_hash == boost_hash){
                            bsts++
                        }
                        
                    }
                    // return all data combined
                    all_posts.push({
                        "user_tag":post.user_tag,
                        "id_hash":post.id_hash,
                        "content":post.content,
                        "channel":post.channel,
                        "boosts":bsts,
                        "ticket":post.ticket,
                        "post_hash":post.post_hash,
                        "ticket_number":post.ticket_number,
                        "timestamp":post.timestamp,
                        "image":post.image
                    })
                }
        return all_posts

}
function getBinarySize(string) {
    return Buffer.byteLength(string, 'utf8');
}

function maketicket() {
    // creates a random string 
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!-_+#?=$"&{([)]}*.:;,';
    var charactersLength = characters.length;
    for (var i = 0; i < 10; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}
async function clearer() {
    // checks for too old tickets by comparing timestamps
    var timestamp = Date.now()
    var margin = (timestamp - 10000)
    await remove(client,margin)
    

    return 200;
}

async function checkticket(dataset, number) {
    const sha256Hasher = crypto.createHash("sha256");
    const server_hash = sha256Hasher.update(dataset).digest("hex");
    // if SHA-256 hash starts with x amount of 0
    if (server_hash.substring(0, 6) == "000000") {
        console.log("[+] hash correct")

        var usticket = dataset.split("<>")
        usticket = usticket[0]
        console.log("my ticket " + usticket)
        console.log("my number " + number)


        var tickets = await ticketer()
        var lengthof = (tickets.length)
        console.log(tickets)
       // console.log(tickets)
        // check if client ticket was sent by the server by using the ticketnumber
        for (var i = 0; i < lengthof; i++) {
            var onumber = tickets[i].n
            console.log("current number: " + onumber)
            if (onumber == number) {
                console.log("[+] number found")
                var eticket = (tickets[i].t)
                if (eticket == usticket) {
                    console.log("[+] tickets match")
                    return true
                }
                else {
                    console.log("[-] tickets dont match")
                }
            }
            else {
                console.log("[-] number not found")
            }

        }


    }
    else {
        console.log("[-] hash wrong")
        return false
    }

}

function secure(data) {
    // secures ID hash and creates a post hash, returns obj
    var user_tag = data.user_tag
    var id_hash = data.id_hash
    var content = data.content
    var channel = data.channel
    var ticket = data.ticket
    var ticket_number = data.number
    var img = data.image
    console.log("IMAGE \n\n size is " + String(round((getBinarySize(img) / 1000),3) + "\n\n"))
    var timestamp = Date.now()
    var sha256Hasher = crypto.createHash("sha256");
    id_hash_new = sha256Hasher.update(id_hash).digest("hex");
    var sha256Hasher = crypto.createHash("sha256");
    post_id_hash = (user_tag + id_hash_new + content + channel + ticket + timestamp)
    post_hash = sha256Hasher.update(post_id_hash).digest("hex");
    var finale = {
        "user_tag": user_tag,
        "id_hash": id_hash_new,
        "content": content,
        "channel": channel,
        "ticket": ticket,
        "post_hash": post_hash,
        "ticket_number": ticket_number,
        "timestamp": timestamp,
        "image": img
    }
    return finale
    


}

function checkpost(data) {
    // checks if post has all necesary data
    if (data.user_tag == "" || data.id_hash == "" || data.content == "" || data.ticket == "" || data.post_hash == "" || data.ticket_number == "") {
        var postvalid = false
    }
    else {
        var postvalid = true
    }
    return postvalid
}


router.get("/tickets", (req, res) => {
    // makes a new ticket
    async function main() {
        await clearer()
        var ticket_ = maketicket()
        var number = Date.now()
        var ticket = {
            "t": ticket_,
            "n": number
        }
        await write_ticket(client, ticket)
        console.log("inserted to db " + ticket.n)
        var test = await ticketer()
        // saves sent ticket
        // sends ticket to client
        console.log(ticket)
        res.send(ticket)
        res.end()
    }
    main()

})

router.get("/ticks", (req, res) => {
    async function finale() {
        var ticks = await ticketer()
        res.send({ "ticks": ticks, "length": ticks.length })
        res.end()
    }
    finale()
})

router.post("/posts", (req, res) => {
    // clients can send a post here
    async function main() {

        var client_data = (req.body)
        var ticket = client_data.ticket
        var number = client_data.number
        console.log(client_data)
        var iscorrect = await checkticket(ticket, number)
        if (iscorrect) {
            var isvalid = checkpost(client_data)
            if (isvalid) {
                var entry = secure(client_data)
                await write(client, entry)
                console.log("[+] post saved")
            }
            else {
                console.log("[-] post not saved (secure err)")
            }
        }
        else {
            console.log("[-] post not saved (ticket err)")
        }
        res.end()
    }
    main()
});


router.post("/boosts", (req, res) => {
    // client can send a boost here
    async function main(){
        var client_data = (req.body)
        var post_id = client_data.post_id
        var iscorrect = await checkticket(client_data.ticket, client_data.ticket_number)
        if (iscorrect) {
            if (post_id !== '') {
                await write(client, client_data)
                console.log("[+] boost saved")
            }
            else {
                console.log("[-] boost not saved")
            }
        }
        else {
            console.log("[-] boost not saved")
        }
        res.end()
    }
    main()
})

router.get("/entrys", (req, res) => {
    // server sends all data (uses combiner)
    async function final() {
        var data = await combiner()
        console.log("[+] sent db")
        res.json(data)
        res.end()
    }
    final()
})

router.get("/search/:type/:value", (req, res) => {
    // client searches for a something
    var type = req.params.type
    var value = req.params.value
    if (type === "user") {
        async function final() {
            var fdata = []
            var data = await combiner()
            for (item of data) {
                if (item.id_hash === value) {
                    fdata.push(item)
                }
            }
            res.json(fdata)
            res.end()
        }
        final()
    }

    if (type === "post") {
        async function final() {
            var fdata = []
            var data = await combiner()
            for (item of data) {
                if (item.post_hash === value) {
                    fdata.push(item)
                }
            }
            res.json(fdata)
            res.end()
        }
        final()
    }

    if (type === "ticket") {
        async function final() {
            var fdata = []
            var data = await combiner()
            for (item of data) {
                if (item.ticket === value) {
                    fdata.push(item)
                }
            }
            res.json(fdata)
            res.end()
        }
        final()
    }

    if (type === "channel") {
        async function final() {
            var fdata = []
            var data = await combiner()
            for (item of data) {
                if (item.channel === value) {
                    fdata.push(item)
                }
            }
            res.json(fdata)
            res.end()
        }
        final()
    }



    if (type === "keyword") {
        async function final() {
            var data = await combiner()
            var all_content = []
            for (item of data) {
                var con = (item.content)
                var cha = (item.channel)
                var use = (item.user_tag)
                // checks if keyword is in content, channel or user tag
                if (con.includes(value) == true || cha.includes(value) == true || use.includes(value) == true) {
                    all_content.push(item)
                }
            }
            res.json(all_content)
            res.end()
        }
        final()
    }
})






router.get("/stat_users", (req, res) => {
    // sends all users (ID and username)
    async function final() {
        var data = await combiner()
        var ids = [...new Set(data.map(item => item.id_hash))];
        all_users = []
        for (hash of ids) {
            var posts_num = 0
            var cur = ""
            for (item of data) {
                if (item.id_hash == hash) {
                    posts_num++
                    cur = item.user_tag
                }
            }
            all_users.push(({
                "user_tag": cur,
                "id": hash,
                "posts": posts_num
            }))
        }
        res.json(all_users)
        res.end()
    }
    final()
})



router.get("/stat_channel", (req, res) => {
    // sends all channels (Number of Posts and name)
    async function final() {
        var data = await combiner()
        var channels = [...new Set(data.map(item => item.channel))];
        all_channels = []
        for (channel of channels) {
            var posts_num = 0
            for (item of data) {
                if (item.channel == channel) {
                    posts_num++
                }
            }
            all_channels.push(({
                "channel": channel,
                "posts": posts_num
            }))
        }
        res.json(all_channels)
        res.end()

    }
    final()
})



router.get("/stat_ticket", (req, res) => {
    // returns all tickets and the user who mined it
    async function final(){
        var data = await combiner()
        var tickets = data.map(function (value) { return value.ticket });
        var user = ""
        all_tickets = []
        for (ticket of tickets) {
            for (item of data) {
                if (item.ticket == ticket) {
                    if (item.id_hash == undefined) {
                        user = "B^   " + item.post_id
                    }
                    else {
                        user = item.id_hash
                    }
                }
            }
            all_tickets.push(({
                "id_hash": user,
                "ticket": ticket
            }))
        }
        console.log(all_tickets)
        res.json(all_tickets)
        res.end()
    }
    final()
})

router.get("/stats", (req, res) => {
    // this returns stats for the /wiki page
    async function final(){
        var data = await combiner()
        var posts = [...new Set(data.map(item => item.post_hash))];
        var names = [...new Set(data.map(item => item.user_tag))];
        var id_hash = [...new Set(data.map(item => item.id_hash))];
        var channels = [...new Set(data.map(item => item.channel))];
        var all_content = []
        for (item of data) {
            var con = (item.content)
            var img = (item.image)
            all_content.push(con)
            if (img != "none"){
                all_content.push(img)
            }
        }
        all_content.push(channels)
        all_content.push(names)
        var compresed = JSON.stringify(all_content).replace(/[\[\]\,\"]/g, '');
        console.log(compresed)
        console.log(getBinarySize(compresed))
        var size = getBinarySize(compresed)
        var finale = {
            "posts": posts.length,
            "content_size": size,
            "id_hash": id_hash.length,
            "channels": channels.length

        }
        res.send(finale)
        res.end()
    }
    final()
})

// finaly we start the server


app.use(`/.netlify/functions/index`, router);

module.exports = app;
module.exports.handler = serverless(app);
