const express = require('express')
const app = express()

app.use('/dist', express.static('dist'))

app.get('/', (req, res) => res.send('home'))

app.listen(3000, () => {
    console.log('is listening!')
})