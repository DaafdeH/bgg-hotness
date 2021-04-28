function populateTable() {
    let period, yearOfPublishing, kickstarter, expansions

    switch (document.getElementById("period").value) {
        case "today":
            period = '1 day'
            break;
        case "week":
            period = '1 week'
            break;
        case "month": 
            period = '1 month'
            break;
        default:
            period = null
    }

    const thisYear = new Date().getFullYear()
    switch(document.getElementById("yop").value) {
        case 'true':
            yearOfPublishing = `AND yearpublished >= ${thisYear}`
            break;
        case 'false':
            yearOfPublishing = `AND yearpublished < ${thisYear}`
            break;
        default:
            yearOfPublishing = ''
    }

    switch (document.getElementById("kickstarter").value) {
        case 'true':
            kickstarter = `AND iskickstarter = true`
            break;
        case 'false':
            kickstarter = `AND iskickstarter = false`
            break;
        default:
            kickstarter = ''
    }

    if (document.getElementById("expansions").value) {
        expansions = `AND type ='boardgame'`
    } else {
        expansions = ''
    }
    
    try {
        getHotGames(period, kickstarter, expansions, yearOfPublishing)
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
            "period": `${period}`,
            "yop": `${yearOfPublishing}`,
            "kickstarter": `${kickstarter}`,
            "expansions": `${expansions}`
        }
    
        const request = await fetch(url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(reqdata),
          })
        const data = await request.json()
        fillTable(data)
    } catch (e) {
        console.error(e)
    }
}

function fillTable(data) {
    const tableBody = document.getElementById("gamesTable").getElementsByTagName("tbody")[0]
    let i = 1

    tableBody.innerHTML = ""

    data.forEach(element => {
        let href = `https://www.boardgamegeek.com/${element.type}/${element.bgg_id}/${element.name}`.replace(/\s+/g, '-').replace(":", "")
        tableBody.insertRow().innerHTML = 
            `<td>${i}</td>` +
            `<td><a href="${href}" target="_blank"><img src=${element.thumbnail}></a></td>` +
            `<td>${element.name}</td>` +
            `<td>${element.yearpublished}</td>` +
            `<td>${element.iskickstarter}</td>` +
            `<td>${element.type}</td>`
        i++
    })        
}