const withClient = require('./PG/pgClient')

module.exports = fetchFromPGDB

async function fetchFromPGDB() {
    const data = await withClient(async (client) => {
        const query = `SELECT * FROM boardgame_items 
        WHERE bgg_id IN 
        (SELECT bgg_id FROM hotness WHERE cast(datetime_polled as date) = CURRENT_DATE)`

        const results = await client.query(query)
        //console.log(resulsts.rows)
        return results.rows
    })
    return data
}