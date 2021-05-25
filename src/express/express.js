const express = require('express')
const bodyParser = require('body-parser')
const path = require('path')
const { fetchDataWithQuery, fetchGraphDataWithQuery } = require('./../fetchService')

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
    const jsonParser = bodyParser.json()

    app.get('', ((req, res) => {
        res.redirect('/home')
    }))

    app.post('/query', jsonParser, (async (req, res) => {
        const { period, kickstarter, expansions, yop } = req.body

        try {
            const data = await fetchDataWithQuery(period, kickstarter, expansions, yop)
            res.json(data)
        } catch (e) {
            res.status(500).send()
        }
    }))

    app.post('/chartquery', jsonParser, (async (req, res) => {
        const { id, period } = req.body
        
        try {
            const data = await fetchGraphDataWithQuery(id, period)
            res.json(data)
        } catch (e) {
            res.status(500).send()
        }
    }))

    // app.get('/somethingelse', function(req, res)  {
    //     const bgg_id = req.query.bgg_id

    //     const url = __dirname.replace(`src\\express`, `public\\chart.html`)

    //     try {
    //         res.sendFile(url)
    //     } catch (e) {
    //         console.error(e)
    //     }
    // })

    app.listen(port, () => {
        console.log(`Server is up on port ${port}`)
    })
}

module.exports = withExpress