const withClient = require('./pgClient')

module.exports = deleteOldItems

async function deleteOldItems() {
    await withClient(async (client) => {
        const query = `SELECT * from hotness WHERE datetime_polled < CURRENT_DATE - INTERVAL '31 DAYS'`
        await client.query(query)
    })  
}