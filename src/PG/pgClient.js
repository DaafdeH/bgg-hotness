const { Client } = require('pg')
const connectionString = process.env.DATABASE_URL

module.exports = withClient

async function withClient(f) {
    const client  = new Client({
        connectionString,
    })
    client.connect()
    
    try {
        await f(client)
    } finally {
        client.end()
    }
}