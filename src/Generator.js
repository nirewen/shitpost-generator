const Canvas = require('canvas')
const Box = require('./Box')
const Point = require('./util/Point')
const TextCoord = require('./util/TextCoord')
const Triangle = require('./util/Triangle')

class Generator {
    constructor ({ background, boxes, overlay, color = 'transparent' }) {
        this.background = background
        this.boxes = Array.isArray(boxes) 
            ? boxes.map(b => new Box(b.points)) 
            : boxes

        if (overlay)
            this.overlay = overlay

        this.color = color
    }

    async loadImages () {
        this.background = await Canvas.loadImage(this.background)

        if (this.overlay)
            this.overlay = await Canvas.loadImage(this.overlay)
    }

    createCanvas () {
        let { width, height } = this.background

        this.canvas = Canvas.createCanvas(width, height)

        this.boxes.forEach(b => b.parsePoint({ width, height }))
        
        console.log(width, width / 2, this.boxes[0].points)
    }

    get ctx () {
        return this.canvas.getContext('2d')
    }

    async from (images) {
        await this.loadImages()
        this.createCanvas()

        let ctx = this.canvas.getContext('2d')

        ctx.drawImage(this.background, 0, 0)

        for (let i in images) {
            if (!this.boxes[i])
                return

            let image = await Canvas.loadImage(images[i])
            let width = (new Point(this.boxes[i].points[0])).length(new Point(this.boxes[i].points[1]))
            let height = (new Point(this.boxes[i].points[1])).length(new Point(this.boxes[i].points[2]))

            let canvas = Canvas.createCanvas(width, height)
            let context = canvas.getContext('2d')

            context.fillStyle = this.color
            context.fillRect(0, 0, width, height)

            let r = image.width / image.height
            let w = canvas.width
            let h = w / r

            if (h > canvas.height) {
                h = canvas.height
                w = h * r
            }

            context.drawImage(image, canvas.width / 2 - w / 2, canvas.height / 2 - h / 2, w, h)

            this.drawImage(canvas, this.boxes[i].points)
        }

        if (this.overlay)
            ctx.drawImage(this.overlay, 0, 0)

        return this.canvas
    }

    drawImage (image, points) {
		let triangles = this.calculateGeometry(image, points)

		for (let tri of triangles) {
			this.drawTriangle(image,
				tri.p0.x, tri.p0.y,
				tri.p1.x, tri.p1.y,
				tri.p2.x, tri.p2.y,
				tri.t0.u, tri.t0.v,
				tri.t1.u, tri.t1.v,
				tri.t2.u, tri.t2.v)
		}
    }

    drawTriangle (im, x0, y0, x1, y1, x2, y2, sx0, sy0, sx1, sy1, sx2, sy2) {
        let ctx = this.ctx

        ctx.save()

        ctx.beginPath()
        ctx.moveTo(x0, y0)
        ctx.lineTo(x1, y1)
        ctx.lineTo(x2, y2)
        ctx.closePath()
        ctx.clip()

        let denom = sx0 * (sy2 - sy1) - sx1 * sy2 + sx2 * sy1 + (sx1 - sx2) * sy0
        if (denom === 0)
            return
            
        let m11 = -(sy0 * (x2 - x1) - sy1 * x2 + sy2 * x1 + (sy1 - sy2) * x0) / denom
        let m12 = (sy1 * y2 + sy0 * (y1 - y2) - sy2 * y1 + (sy2 - sy1) * y0) / denom
        let m21 = (sx0 * (x2 - x1) - sx1 * x2 + sx2 * x1 + (sx1 - sx2) * x0) / denom
        let m22 = -(sx1 * y2 + sx0 * (y1 - y2) - sx2 * y1 + (sx2 - sx1) * y0) / denom
        let dx = (sx0 * (sy2 * x1 - sy1 * x2) + sy0 * (sx1 * x2 - sx2 * x1) + (sx2 * sy1 - sx1 * sy2) * x0) / denom
        let dy = (sx0 * (sy2 * y1 - sy1 * y2) + sy0 * (sx1 * y2 - sx2 * y1) + (sx2 * sy1 - sx1 * sy2) * y0) / denom

        ctx.transform(m11, m12, m21, m22, dx, dy)
        ctx.drawImage(im, 0, 0)
        ctx.restore()
    }

    calculateGeometry (image, points) {
        let triangles = []

        let subs = 7
        let divs = 7
        let ts   = 0.1

        let p1 = new Point(points[0][0], points[0][1])
        let p2 = new Point(points[1][0], points[1][1])
        let p3 = new Point(points[2][0], points[2][1])
        let p4 = new Point(points[3][0], points[3][1])

        let dx1 = p4.x - p1.x
        let dy1 = p4.y - p1.y
        let dx2 = p3.x - p2.x
        let dy2 = p3.y - p2.y

        let imgW = image.width
        let imgH = image.height

        for (let sub = 0; sub < subs; sub += ts) {
            let curRow = sub / subs
            let nextRow = (sub + 1) / subs

            let curRowX1 = p1.x + dx1 * curRow
            let curRowY1 = p1.y + dy1 * curRow

            let curRowX2 = p2.x + dx2 * curRow
            let curRowY2 = p2.y + dy2 * curRow

            let nextRowX1 = p1.x + dx1 * nextRow
            let nextRowY1 = p1.y + dy1 * nextRow

            let nextRowX2 = p2.x + dx2 * nextRow
            let nextRowY2 = p2.y + dy2 * nextRow

            for (let div = 0; div < divs; div += ts) {
                let curCol = div / divs
                let nextCol = (div + 1) / divs

                let dCurX = curRowX2 - curRowX1
                let dCurY = curRowY2 - curRowY1
                let dNextX = nextRowX2 - nextRowX1
                let dNextY = nextRowY2 - nextRowY1

                let p1x = curRowX1 + dCurX * curCol
                let p1y = curRowY1 + dCurY * curCol

                let p2x = curRowX1 + (curRowX2 - curRowX1) * nextCol
                let p2y = curRowY1 + (curRowY2 - curRowY1) * nextCol

                let p3x = nextRowX1 + dNextX * nextCol
                let p3y = nextRowY1 + dNextY * nextCol

                let p4x = nextRowX1 + dNextX * curCol
                let p4y = nextRowY1 + dNextY * curCol

                let u1 = curCol * imgW
                let u2 = nextCol * imgW
                let v1 = curRow * imgH
                let v2 = nextRow * imgH

                let triangle1 = new Triangle(
                    new Point(p1x, p1y),
                    new Point(p3x, p3y),
                    new Point(p4x, p4y),
                    new TextCoord(u1, v1),
                    new TextCoord(u2, v2),
                    new TextCoord(u1, v2)
                )

                let triangle2 = new Triangle(
                    new Point(p1x, p1y),
                    new Point(p2x, p2y),
                    new Point(p3x, p3y),
                    new TextCoord(u1, v1),
                    new TextCoord(u2, v1),
                    new TextCoord(u2, v2)
                )

                triangles.push(triangle1, triangle2)
            }
        }

        return triangles
    }
}

module.exports = Generator
