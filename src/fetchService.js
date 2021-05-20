const withClient = require('./PG/pgClient')

module.exports = { fetchDataWithQuery, fetchGraphDataWithQuery }

async function fetchDataWithQuery(period, kickstarter, expansions, yearOfPublishing) {

    const periodQuery = filterPeriod(period)
    const yopQuery = filterYoP(yearOfPublishing)
    const ksQuery = filterKS(kickstarter)
    const expQuery = filterExp(expansions)

    const filters = [yopQuery, ksQuery, expQuery].filter(Boolean)

    const data = await withClient(async (client) => {
        const query = `
        SELECT h.bgg_id, ROUND(AVG(h.rank), 2) as rankCount, count(h.bgg_id) as occurrences, bi.*
        FROM hotness as h
        INNER JOIN boardgame_items as bi ON h.bgg_id = bi.bgg_id
        WHERE h.datetime_polled >= CURRENT_DATE - INTERVAL '${periodQuery}'
        ${filters.length ? `AND ${filters.join(' AND ')}` : ``}
        GROUP BY h.bgg_id, bi.bgg_id
        ORDER BY rankCount ASC
        LIMIT 50`
        const results = await client.query(query)
        return results.rows
    })
    return data
}

async function fetchGraphDataWithQuery(bgg_id, period) {
    const periodQuery = filterPeriod(period)

    const data = await withClient(async (client) => {
        const query = `SELECT h.datetime_polled, h.rank, b.name, b.yearpublished FROM hotness as h
        LEFT JOIN boardgame_items as b ON h.bgg_id = b.bgg_id
        WHERE h.bgg_id = ${bgg_id} AND h.datetime_polled >= CURRENT_DATE - INTERVAL '${periodQuery}'`
        const results  = await client.query(query)

        return results.rows
    })
    return data
}

function filterPeriod(period) {
    switch (period) {
        case "today":
            return '1 day'
        case "week":
            return '1 week'
        case "month": 
            return '1 month'
        default:
            return '1 day'
    }
}

function filterYoP(yearOfPublishing) {
    const thisYear = new Date().getFullYear()
    switch(yearOfPublishing) {
        case 'true':
            return `yearpublished >= ${thisYear}`
        case 'false':
            return `yearpublished < ${thisYear}`
        default:
            return ''
    }
}

function filterKS(kickstarter) {
    switch (kickstarter) {
        case 'true':
            return `iskickstarter = true`
        case 'false':
            return `iskickstarter = false`
        default:
            return ''
    }
}

function filterExp(expansions) {
    if (expansions) {
        return `type ='boardgame'`
    } else {
        return ''
    }
}