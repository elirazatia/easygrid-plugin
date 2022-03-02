const fs = require('fs')

fs.readFile('./ui.html', (err, data) => {
    var body = data.toString()
    const test = /(?<=<).+(css|js|html|svg)(?=>)/gm

    body = body.replace('<!DOCTYPE html>', '$$doctype$$')
    body = body.replace('</html>', '$$doctype_end$$')
    body.match(test).forEach((element) => {
        // console.log('element', element)
        const fileData = fs.readFileSync(element)
        const string = fileData.toString()

        if (element.includes('.svg')) {
            body = body.replace(`<${element}>`, `${string}`)
        } else if (element.includes('.css')) {
            body = body.replace(`<${element}>`, `<style>${string}</style>`)
        } else if (element.includes('.js')) {
            body = body.replace(`<${element}>`, `${string}`)
        }
        
        // if (element.includes('.css')) {
        //     body = body.replace(`<${element}>`, `<style>${string}</style>`)
        // } else if (element.includes('.js')) {
        //     body = body.replace(`<${element}>`, `${string}`)
        // } else if (element.includes('.svg')) {
        //     body = body.replace(`<${element}>`, `${string}`)
        // }
    })

    // body = body.replace('$$doctype$$', '<!DOCTYPE html>')
    // body = body.replace('$$doctype_end$$', '</html>')
    fs.writeFile('./dist/ui.html', body, (err) => { console.log(err) })
    console.log('completed')
})