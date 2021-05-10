const withClient = require('./PG/pgClient')

module.exports = fetchDataWithQuery

async function fetchDataWithQuery(period, kickstarter, expansions, yearOfPublishing) {

    const periodQuery = filterPeriod(period)
    const yopQuery = filterYoP(yearOfPublishing)
    const ksQuery = filterKS(kickstarter)
    const expQuery = filterExp(expansions)
    let where;

    if (yopQuery || ksQuery || expQuery) {
        where = 'WHERE'
    }

    const data = await withClient(async (client) => {
        const query = `SELECT * FROM boardgame_items
        WHERE bgg_id IN
        (SELECT bgg_id FROM hotness WHERE datetime_polled >= CURRENT_DATE - INTERVAL '${periodQuery}') ${ksQuery} ${expQuery} ${yopQuery}`
        const results = await client.query(query)
        //console.log(results.rows)
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
            return null
    }
}

function filterYoP(yearOfPublishing) {
    const thisYear = new Date().getFullYear()
    switch(yearOfPublishing) {
        case 'true':
            return `AND yearpublished >= ${thisYear}`
        case 'false':
            return `AND yearpublished < ${thisYear}`
        default:
            return ''
    }
}

function filterKS(kickstarter) {
    switch (kickstarter) {
        case 'true':
            return `AND iskickstarter = true`
        case 'false':
            return `AND iskickstarter = false`
        default:
            return ''
    }
}

function filterExp(expansions) {
    if (expansions) {
        return `AND type ='boardgame'`
    } else {
        return ''
    }
}