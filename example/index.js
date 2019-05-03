const fs = require('fs')
const { Generator, Box } = require('../src')

let generate = new Generator({
    background: 'example/img/background.png',
    overlay: 'example/img/overlay.png',
    boxes: [
        new Box([
            [ 449, 254], [1134,  174],
            [1134, 991], [ 449, 1076]
        ])
    ]
})

generate.from([
    'example/img/shrek.jpg'
]).then(canvas => 
    fs.writeFileSync('example/out/result.png', canvas.toBuffer())
)
