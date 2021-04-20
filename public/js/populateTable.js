window.addEventListener("load", function() {
    const tableBody = document.getElementById("gamesTable").getElementsByTagName("tbody")[0]
    
    async function getHotGames() {
        const url = window.location.href + "./../data"
        try {
            const request = await fetch(url)
            const data = await request.json()
            fillTable(data)
        } catch (e) {
            console.error(e)
        }
    }

    function fillTable(data) {

        data.forEach(element => {
            //console.log(element)
            tableBody.insertRow().innerHTML = 
                `<td><img src=${element.thumbnail} target="_blank"></td>` +
                `<td>${element.name}</td>` +
                `<td>${element.yearpublished}</td>` +
                `<td>${element.iskickstarter}</td>` +
                `<td>${element.type}</td>`  
        })

        
    }

    getHotGames()
})