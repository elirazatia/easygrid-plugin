const chokidar = require('chokidar')
const { exec } = require("child_process");

function updated() {
    exec("npm run build", (error, stdout, stderr) => {
        if (error) return console.log(`error: ${error.message}`)
        if (stderr) return console.log(`stderr: ${stderr}`)

        console.log(`Did update build`)
    });
}

chokidar.watch('scripts', {})
    .on('change', updated)