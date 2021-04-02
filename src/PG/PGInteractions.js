const withClient = require('./pgClient')

module.exports = {hotItemsToPGDB, addNewGamesToPGDB}

async function hotItemsToPGDB(items) {
    await withClient(async (client) => {
        const dateTime = new Date()
        const bundle = items.map(async (boardGame) => {
            const query = 'INSERT INTO hotness(bgg_id, rank, datetime_polled) VALUES($1, $2, $3)'
            const values = [boardGame.id, boardGame.rank, dateTime]
            await client.query(query, values)
        })
        await Promise.all(bundle)
    })     
}

async function addNewGamesToPGDB(items) {
    await withClient(async (client) => {
        const tableName = 'tempGames'

        const createQuery = `CREATE TABLE public.${tableName}(
            bgg_id integer,
            name text,
            yearpublished integer,
            iskickstarter boolean,
            thumbnail text,
            type text)`
        await client.query(createQuery)

        const bundle = items.map(async (boardGame) => {
            const addQuery = `INSERT INTO ${tableName}(bgg_id, name, yearpublished, iskickstarter, thumbnail, type) VALUES($1, $2, $3, $4, $5, $6)`
            const values = [boardGame.id, boardGame.name.value, boardGame.yearpublished.value, boardGame.isKickstarter, boardGame.thumbnail, boardGame.type]
            await client.query(addQuery, values)
        })
        await Promise.all(bundle)

        const joinQuery = `INSERT INTO boardgame_items(bgg_id, name, yearpublished, iskickstarter, thumbnail, type) 
        SELECT ${tableName}.bgg_id, ${tableName}.name, ${tableName}.yearpublished, ${tableName}.iskickstarter, ${tableName}.thumbnail, ${tableName}.type
        FROM ${tableName}
        EXCEPT
        SELECT bgg_id, name, yearpublished, iskickstarter, thumbnail, type
        FROM boardgame_items`

        await client.query(joinQuery)

        const dropTableQuery = `DROP TABLE IF EXISTS ${tableName}`
        await client.query(dropTableQuery)
    })
}