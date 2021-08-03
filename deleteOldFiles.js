const deleteOldItems = require('./src/PG/deleteOldItems')

run()
console.log('Deleting old hotness items older than 30 days at ', new Date().toDateString() , new Date().toLocaleTimeString('nl-NL'))

async function run() {
    try {
        await deleteOldItems()
        console.log('Just finished deleting old hot items at ', new Date().toDateString() , new Date().toLocaleTimeString('nl-NL'))
    } catch (error) {
        console.error(error)
    }
}