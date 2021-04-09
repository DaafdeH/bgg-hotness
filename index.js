const cron = require('node-cron')
const getHotness = require('./src/getHotness')

run()
console.log('Starting cron timer process')
cron.schedule('0 */12 * * * ', run)

async function run() {
    try {
        await getHotness()
        console.log('Just finished updating hot items at ', new Date().toDateString() , new Date().toLocaleTimeString('nl-NL'))
    } catch (error) {
        console.error(error)
    }
}