// const express = require('express')
// const app = express()

const fs = require('chokidar')
const { exec } = require("child_process");

function updated() {
    exec("npm run build", (error, stdout, stderr) => {
        if (error) return console.log(`error: ${error.message}`)
        if (stderr) return console.log(`stderr: ${stderr}`)

        console.log(`Did update build`)
    });
}

fs.watch('scripts', {})
    .on('change', updated)

// fs.watch('scripts', (cur, prev) => {
//     console.log('')
// })

// app.get('/', (req, res) => {
//     res.sendFile(__dirname + '/dist/ui.html')
// })

// app.listen(2888, () => console.log('LISTENING ON PORT 2888'))