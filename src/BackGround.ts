import * as PIXI from "pixi.js"
import { WIDTH, HEIGHT, GlobalParam } from './global'
export class BackGround {
    private stars: Star[] = []
    private r: MyRand
    private y: number
    constructor(private container: PIXI.Container, private stage: number) {
        this.r = new MyRand(stage)
        for (this.y = HEIGHT; this.y > 0; this.y--)this.update()
    }
    public update() {
        let r = this.r
        while (r.rand() % 5 == 0) {
            this.stars.push(new Star(this.container, r.rand() % WIDTH, this.y, this.getcolor(),
                r.rand() % 200 + 120, r.rand() % 10 + 10))
        }
        this.stars.forEach(n => n.update())
        this.stars = this.stars.filter(n => n.check_and_delete())
    }
    private getcolor() {
        const r = [1000, 800, 300, 30]
        const g = [30, 500, 200, 30]
        const b = [30, 100, 300, 1000]
        let v = this.r.rand() % 100 / 100
        let k = this.r.rand() % 3
        return this.RGB(v * r[k] + (1 - v) * r[k + 1],
            v * g[k] + (1 - v) * g[k + 1],
            v * b[k] + (1 - v) * b[k + 1])
    }
    private RGB(r: number, g: number, b: number) {
        return (Math.min(r, 0xff) << 16) | (Math.min(g, 0xff) << 8) | Math.min(b, 0xff)
    }
}
class Star {
    private star: PIXI.Container
    private graph: PIXI.Graphics
    constructor(private container: PIXI.Container, private x: number, private y: number, private color: number, private distance: number, private bright: number) {
        this.star = new PIXI.Container()
        const graph = new PIXI.Graphics()
        bright = 500 * bright / (distance * distance)
        graph.beginFill(color, bright)
        graph.lineStyle(0.5, color, 0.5 * bright, 0.5)
        graph.drawCircle(0, 0, 1)
        graph.drawCircle(1, 0, 1)
        graph.drawCircle(0, 1, 1)
        graph.drawCircle(-1, 0, 1)
        graph.drawCircle(0, -1, 1)
        graph.lineStyle(0)
        graph.beginFill(0xffffff, bright)
        graph.drawCircle(0, 0, 1)
        graph.endFill()
        graph.blendMode = PIXI.BLEND_MODES.ADD
        this.star.addChild(graph)
        this.star.position.set(x, y)
        this.star.zIndex = -1
        this.container.addChild(this.star)
        this.graph = graph
    }
    public update() {
        this.star.y += 100 / this.distance
    }
    public check_and_delete() {
        if (this.star.y <= HEIGHT + 10) return true
        this.container.removeChild(this.star)
        this.star.destroy()
        return false
    }
}
export class MyRand {
    readonly A = 1025
    readonly B = 625
    readonly M = 1024 * 1024
    private v: number
    constructor(vv: number) {
        this.srand(vv)
    }
    public rand() {
        return this.v = (this.A * this.v + this.B) % this.M
    }
    public srand(vv: number) {
        this.v = vv
    }
}