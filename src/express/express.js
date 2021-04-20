const express = require('express')
const path = require('path')
const fetchData = require('./../fetchService')

const withExpress = function () {
    const app = express()
    const port = process.env.PORT || 3000
    const publicDirectoryPath = path.join(__dirname, '../../public')


    const options = {
        dotfiles: 'ignore',
        etag: false,
        extensions: ['htm', 'html'],
        index: false,
        redirect: false,
        setHeaders: function (res, path, stat) {
            res.set('x-timestamp', Date.now())
          }
    }
    app.use(express.static(publicDirectoryPath, options))

    app.get('/data', (async (req, res) => {
        try {
            const data = await fetchData()
            res.json(data)
        } catch (e) {
            res.status(500).send()
        }
    }))

    app.listen(port, () => {
        console.log(`Server is up on port ${port}`)
    })
}

module.exports = withExpress