const withClient = require('./pgClient')

async function InitHerokuTables() {
    await withClient(async (client) => {
        const buildQuery = `CREATE TABLE public.boardgame_items
        (
            bgg_id integer NOT NULL,
            name text COLLATE pg_catalog."default" NOT NULL,
            yearpublished integer,
            iskickstarter boolean,
            thumbnail text COLLATE pg_catalog."default",
            type text COLLATE pg_catalog."default"
        );
        
        CREATE TABLE public.hotness
        (
            bgg_id integer NOT NULL,
            rank smallint,
            datetime_polled timestamp without time zone
        );`
        await client.query(buildQuery)
    })
}

module.exports = InitHerokuTables