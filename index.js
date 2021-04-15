const getHotness = require('./src/getHotness')
const startWeb = require('./src/express/express')

run()
console.log('Started')

//startWeb()

async function run() {
    try {
        await getHotness()
        console.log('Just finished updating hot items at ', new Date().toDateString() , new Date().toLocaleTimeString('nl-NL'))
    } catch (error) {
        console.error(error)
    }
}