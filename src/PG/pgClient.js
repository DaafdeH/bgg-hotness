const { Client } = require('pg')

module.exports = withClient

async function withClient(f) {
if (process.env.ENVIRONMENT === 'PRD') {
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
} else {
    const client  = new Client({
        connectionString: process.env.DATABASE_URL
    })
    client.connect()
    
    try {
        const data = await f(client)
        return data
    } finally {
        client.end()
        
    }
}

}