class Box { 
    constructor (points) {
        this.points = points
    }

    parsePoint ({ width, height }) {
        for (let [i, point] of this.points.entries()) {
            let [x, y] = point
            
            if (typeof x === 'string')
                x = parseInt(x) / 100 * width
            if (typeof y === 'string')
                y = parseInt(y) / 100 * height

            this.points[i] = [x, y]
        }
    }
}

module.exports = Box
