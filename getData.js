const getHotness = require('./src/getHotness')

run()
console.log('Started')

async function run() {
    try {
        await getHotness()
        console.log('Just finished updating hot items at ', new Date().toDateString() , new Date().toLocaleTimeString('nl-NL'))
    } catch (error) {
        console.error(error)
    }
}