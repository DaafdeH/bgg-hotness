const express = require('express')

const withExpress = function () {
    const app = express()
    const port = process.env.PORT || 3000

    app.get('/', function (req, res) {
        res.send('Running!')
    })

    app.listen(port)
}

module.exports = withExpress