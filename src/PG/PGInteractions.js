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

        const createQuery = `DROP TABLE IF EXISTS ${tableName};
        
        CREATE TABLE public.${tableName}(
            bgg_id integer,
            name text,
            yearpublished integer,
            iskickstarter boolean,
            thumbnail text,
            type text)`
        await client.query(createQuery)

        const bundle = items.map(async (boardGame) => {
            const yearPublished = boardGame.yearpublished !== undefined ? boardGame.yearpublished.value : new Date().getFullYear()

            const addQuery = `INSERT INTO ${tableName}(bgg_id, name, yearpublished, iskickstarter, thumbnail, type) VALUES($1, $2, $3, $4, $5, $6)`
            const values = [boardGame.id, boardGame.name.value, yearPublished, boardGame.isKickstarter, boardGame.thumbnail, boardGame.type]
            await client.query(addQuery, values)
        })
        await Promise.all(bundle)

        const joinQuery = `INSERT INTO boardgame_items(bgg_id, name, yearpublished, iskickstarter, thumbnail, type)
		SELECT * FROM ${tableName}
        WHERE NOT EXISTS (SELECT bgg_id FROM boardgame_items WHERE boardgame_items.bgg_id = ${tableName}.bgg_id)`

        await client.query(joinQuery)

        const dropTableQuery = `DROP TABLE IF EXISTS ${tableName}`
        await client.query(dropTableQuery)
    })
}