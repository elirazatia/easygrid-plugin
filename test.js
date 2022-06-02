const express = require('express')
const app = express()

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/dist/ui.html')
})

app.listen(2888, () => console.log('LISTENING ON PORT 2888'))