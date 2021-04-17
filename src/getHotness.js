const fetch = require('node-fetch')
const parser = require('xml2json')
const { hotItemsToPGDB, addNewGamesToPGDB } = require('./PG/PGInteractions')

module.exports = getHotness

async function getHotness() {
    const bggItems = await queryBGG()

    var attempts = 0;
    var updateditems;

    while (updateditems == null && attempts < 5) {
        updateditems = await updateItems(bggItems)
        attempts++
    }

    if (updateditems == null) {
        throw new Error('Failed to update iteminformation after 5 tries. No new attempts will be made')
    }

    await hotItemsToPGDB(bggItems)
    await addNewGamesToPGDB(updateditems)
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

    return items
}

async function updateItems(items) {
    const updatedItems = items.map(async (item) => {
        const url = `https://www.boardgamegeek.com/xmlapi2/thing?id=${item.id}`
        const res = await fetch(url)

        if (!res.ok) {
            return null;
            //throw new Error(`HTTP error getting page for ${url}: ${res.status}`)
        }

        const xml = await res.text()
        const data = parser.toJson(xml, { object:true, coerce: true})

        const thumbnail = data.items.item.thumbnail
        const type = data.items.item.type
        
        const links = data.items.item.link
        
        const isKickstarter = links.some(link => link.value === 'Crowdfunding: Kickstarter')
        return { ...item, isKickstarter, thumbnail, type }
    })
    
    const result = await Promise.all(updatedItems)
    return result
}