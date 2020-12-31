import * as PIXI from "pixi.js"
import { WIDTH, HEIGHT, SPEED, inv_Phi } from './global'
import { Key } from './key'
import { Screen } from './Screen'
import { GraphicManager } from './GraphicManager'
const N = 20
const W = WIDTH / N
const GROUND = HEIGHT * 0.7
const NORMAL = 0
const HOLL = 1
const MOUNTAIN = 2

const DEPTH = HEIGHT * 2

const LIMIT = 6

export class Ground {
    private container: PIXI.Container
    private ground: PIXI.Graphics[] = []
    private time: number = 0
    private high: number[] = []
    private r: MyRand
    private holl_c: number = 0
    private state: number = NORMAL
    private toge_num: number = 0
    private toge_c: number = 0
    private diff: number = 0
    private last_holl_size: number = 0
    constructor() {
        this.r = new MyRand(100)
        this.container = Screen.init().getContainer()
        for (let i = 0; i <= N + 5; i++) {
            this.high.push(HEIGHT * 0.7)
            this.make_ground(HEIGHT * 0.7, HEIGHT * 0.7)
        }
    }
    public update() {
        this.ground.forEach((n) => n.x -= SPEED)
        let temp = this.ground.filter((n) => n.x < -W * 3)
        temp.forEach((n) => { this.container.removeChild(n); })
        this.ground = this.ground.filter((n) => n.x >= -W * 3)
        for (let i = 0; i < temp.length; i++) {
            this.high = this.high.slice(1)
            this.get_next_height()
        }
        this.time++;
        if (this.time % 300 == 0) this.diff++
    }
    public generate_enemy() {
        if (this.time % (W / SPEED) || this.state == HOLL || this.is_edge()) return false
        let f: boolean
        if (this.toge_num) f = (this.r.rand() % 6 <= 2)
        else f = this.r.rand() % 5 == 0
        if (this.toge_c && this.toge_num == 0) f = false, this.toge_c--
        if (f && this.toge_num < (LIMIT - this.last_holl_size - 1)) {
            this.toge_num++
            this.toge_c = 5
            return this.r.rand() % 10 < 8
        }
        else this.toge_num = 0
        return false
    }
    private is_edge() {
        let id
        for (id = 0; id < N + 5; id++) {
            if (this.ground[id].x + W > WIDTH + 16 - W * 3 / 2) break
        }
        return this.high[id + 1] == DEPTH
    }
    private get_next_height() {
        let new_h: number = HEIGHT
        let prev_h: number, d: number
        switch (this.state) {
            case NORMAL:
                for (let i = this.high.length - 1; i >= 0; i--) {
                    if (this.high[i] != DEPTH) {
                        prev_h = this.high[i] + (this.high.length - 1 - i) * (this.r.rand() % 20 - 9)
                        prev_h = Math.max(HEIGHT * 0.1, Math.min(prev_h, HEIGHT * 0.9))
                        if (i == this.high.length - 1) this.last_holl_size = 0
                        break
                    }
                }
                d = inv_Phi(this.r.rand() % 1000 / 1000) * 10
                new_h = prev_h + d
                new_h = Math.max(HEIGHT * 0.1, Math.min(new_h, HEIGHT * 0.9))
                this.high.push(new_h)
                this.make_ground(prev_h, new_h)
                if (this.r.rand() % Math.max(40 - this.diff, 20) == 0 && this.toge_c == 0) this.state = HOLL, this.holl_c = 0
                break
            case HOLL:
                if (this.holl_c >= 2 && this.r.rand() % Math.min(4, 2 + Math.floor(this.diff / 10)) == 0
                    || this.holl_c >= LIMIT) {
                    this.state = NORMAL
                    this.last_holl_size = this.holl_c
                }
                this.holl_c++
                this.high.push(DEPTH)
                this.make_ground(DEPTH, DEPTH)
                break
        }
    }
    private make_ground(h1: number, h2: number) {
        let x: number
        if (this.ground.length == 0) x = 0
        else x = this.ground[this.ground.length - 1].x + W
        const g = new PIXI.Graphics()
        g.beginFill(0x666600, 0.8)
        g.drawPolygon([0, h1, 0, HEIGHT, W, HEIGHT, W, h2])
        g.endFill()
        g.x = x
        g.zIndex = -1
        this.ground.push(g)
        this.container.addChild(g)
    }
    public get_groundHeight(x: number) {
        let id: number
        x -= W * 3 / 2
        for (id = 0; id < N + 5; id++) {
            if (this.ground[id].x + W > x) break
        }
        let _x = this.ground[id].x
        let H1 = this.high[id], H2 = this.high[id + 1], H3 = this.high[id + 2]
        if (H1 == DEPTH) H1 = Math.min(H2, H3)
        if (H2 == DEPTH) H2 = Math.min(H1, H3)
        if (H3 == DEPTH) H3 = Math.min(H1, H2)
        let h1 = (H2 * (x - _x) + H1 * (_x + W - x)) / W
        let h2 = H2
        let h3 = (H3 * (x - _x) + H2 * (_x + W - x)) / W
        return Math.max(h1, h2, h3)
    }
    public release() {
        let container = Screen.init().getContainer()
        this.ground.filter((n) => container.removeChild(n))
    }
}
class MyRand {
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