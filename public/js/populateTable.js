async function populateTable() {
    try {
        const period = document.getElementById("period").value
        const yearOfPublishing = document.getElementById("yop").value
        const kickstarter = document.getElementById("kickstarter").value
        const expansions = document.getElementById("expansions").value
    
    
        const data = await getHotGames(period, kickstarter, expansions, yearOfPublishing)
        fillTable(data)
    }
    catch (e) {
        console.error(e)
    }
}

async function getHotGames(period, kickstarter, expansions, yearOfPublishing) {
    if (period == null) {
        throw new Error('period is incorrect!')
    }

    const url = window.location.href.replace("/home", "/query")
    try {
        const reqdata = {
            period,
            "yop": `${yearOfPublishing}`,
            kickstarter,
            expansions
        }
        
        const request = await fetch(url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(reqdata),
          })
        
        const data = await request.json()
        return data
    } catch (e) {
        console.error(e)
    }
}

function fillTable(data) {
    const tableBody = document.getElementById("gamesTable").getElementsByTagName("tbody")[0]
    const period = document.getElementById("period").value
    let i = 1

    tableBody.innerHTML = ""

    data.forEach(element => {
        let href = `https://www.boardgamegeek.com/${element.type}/${element.bgg_id}`
        let buttonHref = window.location.href.replace('home', `chart?bgg_id=${element.bgg_id}&name=${element.name}&period=${period}&yop=${element.yearpublished}`)
        tableBody.insertRow().innerHTML = 
            `<td>${i}</td>` +
            `<td>${element.rankcount}</td>` +
            `<td>${element.occurrences}</td>` +
            `<td><a href="${href}" target="_blank"><img src=${element.thumbnail}></a></td>` +
            `<td>${element.name}</td>` +
            `<td>${element.yearpublished}</td>` +
            `<td>${element.iskickstarter}</td>` +
            `<td>${element.type}</td>` +
            `<td><button type="button" onclick="location.href='${buttonHref}'">Graph for ${element.name}</button></td>`
        i++
    })        
}