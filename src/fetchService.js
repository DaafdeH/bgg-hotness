const withClient = require('./PG/pgClient')

module.exports = fetchDataWithQuery

async function fetchDataWithQuery(period, kickstarter, expansions, yop) {

    const data = await withClient(async (client) => {
        const query = `SELECT * FROM boardgame_items
        WHERE bgg_id IN
        (SELECT bgg_id FROM hotness WHERE datetime_polled >= CURRENT_DATE - INTERVAL '${period}') ${kickstarter} ${expansions} ${yop}`
        const results = await client.query(query)
        //console.log(results.rows)
        return results.rows
    })
    return data
}