const fetch = require('node-fetch')
const parser = require('xml2json')
const withClient = require('./pgClient')

module.exports = getHotness

async function getHotness() {
    const bggItems = await queryBGG()
    const updatedItems = await checkKS(bggItems)
    await itemsToPG(updatedItems)
}

async function queryBGG() {
    const url = 'https://api.geekdo.com/xmlapi2/hot'

    const res = await fetch(url)

    if (!res.ok) {
        throw new Error(`HTTP error: ${res.status}`)
    }

    const xml = await res.text()
    const data = parser.toJson(xml, { object:true, coerce: true})
    const items = data.items.item
    //console.log(items)

    return items
}

async function checkKS(items) {
    const updatedItems = items.map(async (item) => {
        const url = `https://www.boardgamegeek.com/xmlapi2/thing?id=${item.id}`
        const res = await fetch(url)

        if (!res.ok) {
            throw new Error(`HTTP error getting page for ${url}: ${res.status}`)
        }

        const xml = await res.text()
        const data = parser.toJson(xml, { object:true, coerce: true})
        
        const links = data.items.item.link
        const isKickstarter = links.some(link => link.value === 'Crowdfunding: Kickstarter')
        return { ...item, isKickstarter }
    })
    
    const result = await Promise.all(updatedItems)
    return result
}

async function itemsToPG(items) {
    await withClient(async (client) => {
        const bundle = items.map(async (boardGame) => {
            const query = 'INSERT INTO boardGames(bgg_id, name, yearpublished, iskickstarter, rank) VALUES($1, $2, $3, $4, $5)'
            const values = [boardGame.id, boardGame.name.value, boardGame.yearpublished.value, boardGame.isKickstarter, boardGame.rank]
            await client.query(query, values)
        })
        await Promise.all(bundle)
    })     
}

//feedback Erik:
//- Alle functions als functions vermelden en geen anonieme arrow functies: Stack traces helderder, volgorde functies komt te vervallen, leesbaarder
// Functies met keyword 'function' worden door runtime/parser/compiler naar bovenkant 'gehoist', dus locatie maakt dan niet meer uit in script