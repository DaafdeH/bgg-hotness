const fetch = require('node-fetch')
const parser = require('xml2json')
const withClient = require('./src/PG/pgClient')

run()

async function run () {
    try {
        await UpdateDB()
    } catch (e) {
        console.error(e)
    }
}

async function UpdateDB() {
    const missingIDs = await withClient(async (client) => {
        const query = `SELECT DISTINCT h.bgg_id FROM hotness h
        LEFT JOIN boardgame_items bi on h.bgg_id = bi.bgg_id
        WHERE bi.bgg_id is null`

        const result = await client.query(query)
        const missingIDs = result.rows
        
        return missingIDs
    })

    const updatedItems = missingIDs.map(async (item) => {
        const url = `https://www.boardgamegeek.com/xmlapi2/thing?id=${item.bgg_id}`

        const res = await fetch(url)

        if (!res.ok) {
            return null;
            //throw new Error(`HTTP error getting page for ${url}: ${res.status}`)
        }

        const xml = await res.text()
        const data = parser.toJson(xml, { object:true, coerce: true})
        //console.log(data.items.item)
        
        //console.log(data)
        const nameArray = data.items.item.name
        let name;
        if (Object.prototype.toString.call(nameArray) === '[object Array]') {
            name = nameArray[0].value
        } else {
            name = nameArray.value
        }

        const yearpublished = data.items.item.yearpublished.value
        const thumbnail = data.items.item.thumbnail
        const type = data.items.item.type
        
        const links = data.items.item.link
        
        const isKickstarter = links.some(link => link.value === 'Crowdfunding: Kickstarter')
        return { ...item, name, yearpublished, isKickstarter, thumbnail, type }      
    })
    const items = await Promise.all(updatedItems)
    
    await withClient(async (client2) => {
        const bundle = await items.map(async (boardGame) => {
            //console.log(boardGame)
            const query2 = `INSERT INTO boardgame_items(bgg_id, name, yearpublished, iskickstarter, thumbnail, type)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *`
            const values = [boardGame.bgg_id, boardGame.name, boardGame.yearpublished, boardGame.isKickstarter, boardGame.thumbnail, boardGame.type]
        
            await client2.query(query2, values)
            
        })
        
        await Promise.all(bundle)
    })
}