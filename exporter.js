const fs = require('fs')

/**
 * Read the UI file and change svg, css, and js tags to inline ones due the inability to link external resources on Figma Plugin APIs
 */
fs.readFile('./ui.html', (err, data) => {
    var body = data.toString()
    const test = /(?<=<).+(css|js|html|svg)(?=>)/gm

    body = body.replace('<!DOCTYPE html>', '$$doctype$$')
    body = body.replace('</html>', '$$doctype_end$$')
    body.match(test).forEach((element) => {
        const fileData = fs.readFileSync(element)
        const string = fileData.toString()

        if (element.includes('.svg')) {
            body = body.replace(`<${element}>`, `${string}`)
        } else if (element.includes('.css')) {
            body = body.replace(`<${element}>`, `<style>${string}</style>`)
        } else if (element.includes('.js')) {
            body = body.replace(`<${element}>`, `${string}`)
        } 
    })

    fs.writeFile('./dist/ui.html', body, (err) => { console.log(err) })
    console.log('completed')
})