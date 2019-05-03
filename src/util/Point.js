class Point {
	constructor (x = 0, y = 0) {
		if (Array.isArray(x) && y === 0) {
			this.x = x[0]
			this.y = x[1]
		} else {
			this.x = x
			this.y = y
		}
	}

	length (point) {
        point = point || new Point()
        
        let xs = 0
        let ys = 0
        
		xs = point.x - this.x
		xs **= 2

		ys = point.y - this.y
        ys **= 2
        
		return Math.sqrt(xs + ys)
	}
}

module.exports = Point
