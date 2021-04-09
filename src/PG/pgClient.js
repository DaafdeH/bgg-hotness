const { Client } = require('pg')
// const connectionString = 

module.exports = withClient

async function withClient(f) {
    const client  = new Client({
        connectionString: process.env.DATABASE_URL,
        ssl: {
            rejectUnauthorized: false
        }
    })
    client.connect()
    
    try {
        await f(client)
    } finally {
        client.end()
    }
}