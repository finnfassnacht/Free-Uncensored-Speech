// the wiki has basically static
function main() {
    // gets the website stats and displays it to the page
    async function fetcher() {
        var raw = await fetch("/.netlify/functions/index/stats")
        var data = await raw.json()
        var posts = data.posts
        var ids = data.id_hash
        var channels = data.channels
        var content = data.content_size
        var size = ((content) / 1000)
        size = size.toFixed(1)
        console.log(content)
        document.getElementById("content").innerText = (String(size)) + "KB"
        document.getElementById("posts").innerText = posts
        document.getElementById("IDs").innerText = ids
        document.getElementById("channels").innerText = channels
    }
    fetcher()
}
main()