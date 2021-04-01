const cron = require('node-cron')
const getHotness = require('./src/getHotness')

run()
cron.schedule('0 * * * * ', run)

async function run() {
    try {
        await getHotness()
        console.log('Just finished updating hot items at ', new Date().toISOString().slice(11,19))
    } catch (error) {
        console.error(error)
    }
}