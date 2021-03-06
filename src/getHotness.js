const fetch = require('node-fetch')
const parser = require('xml2json')
const { hotItemsToPGDB, addNewGamesToPGDB } = require('./PG/PGInteractions')

module.exports = getHotness

async function getHotness() {
        const bggItems = await queryBGG()
        const updateditems = await fetchItems(bggItems)

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

async function fetchItems(items) {
    console.log(`Retrieving ${items.length} items`)
    const result = await executeSequential(items, retryOnError(
        { 
            retries: 5, 
            onRetry: ({ availableRetries }) => console.log(`Retrying, ${availableRetries} retries left`),
        },
        async (item) => {
            // console.log(`Retrieving item with id ${item.id}`)
            const url = `https://www.boardgamegeek.com/xmlapi2/thing?id=${item.id}`
            const res = await fetch(url)
            // console.log(`Done`)
            process.stdout.write('.')

            if (!res.ok) {
                throw new Error(`Didn't get data at ${item.id} due to ${res.status}`)
            }

            const xml = await res.text()
            const data = parser.toJson(xml, { object:true, coerce: true})

            const thumbnail = data.items.item.thumbnail
            const type = data.items.item.type
            
            const links = data.items.item.link
            
            const isKickstarter = links.some(link => link.value === 'Crowdfunding: Kickstarter')
            return { ...item, isKickstarter, thumbnail, type }
        }
    ))
    console.log('')
    console.log('Done')
    
    if (result.includes(null)) {
        return null
    } else {
        return result
    }
}

async function executeSequential(items, f) {
    return items.reduce(
        async (previousResultPromise, item) => {
            const result = await previousResultPromise
            await timeout(200)
            const newItemPromise = await f(item)
            return [...result, newItemPromise]
        },
        Promise.resolve([])
    )
}

function retryOnError({ retries, onRetry }, f) {
    return async (...args) => {
        try {
            const result = await f(...args)
            return result
        } catch (e) {
            if (!retries) throw e

            const timeToWait = calculateWaitTime({ maxWaitTime: 25000, retries })
            console.log(`Call failed due to ${e.name}, waiting for ${timeToWait} milliseconds before trying again`)
            await timeout(timeToWait)
            
            const availableRetries = retries - 1

            onRetry({ availableRetries })

            const retryOnErrorFunction = retryOnError({ retries: availableRetries,onRetry }, f)
            const result = await retryOnErrorFunction(...args)
            return result
        }
    }
}

function calculateWaitTime({ maxWaitTime, retries }) {
    const factor = 1 / retries
    const adjustedFactor = Math.pow(factor, 2)
    const totalWaitTime = Math.ceil(maxWaitTime * adjustedFactor)
    return totalWaitTime
}

async function timeout(milliseconds) {
    return new Promise((resolve) => { setTimeout(resolve, milliseconds) })
} 