import * as PIXI from "pixi.js"
import { WIDTH, HEIGHT, GlobalParam, SPEED, G } from './global'
import { Key } from './key'
import { Screen } from './Screen'
import { GraphicManager } from './GraphicManager'
import { Ground } from "./Ground"

export class Enemy {
    private x: number = WIDTH + 16
    private y: number = 0
    private vx: number = 0
    private vy: number = 0
    private ax: number = 0
    private ay: number = 0
    private landing: boolean = false
    private sprite: PIXI.Sprite
    public flag: boolean = true
    constructor(private ground: Ground) {
        this.y = this.ground.get_groundHeight(this.x)

        let graph = GraphicManager.GetInstance()
        this.sprite = graph.GetSprite("toge")

        let container = Screen.init().getContainer()
        container.addChild(this.sprite)
        this.sprite.anchor.set(0.5)
        this.sprite.position.set(this.x, this.y)
        this.sprite.zIndex = -2
    }
    public update() {
        this.x -= SPEED
        this.sprite.position.set(this.x, this.y - this.sprite.height / 2)
        if (this.x < -SPEED * 3) this.flag = false, this.release()
    }
    public collision(px: number, py: number) {
        return Math.sqrt(Math.pow(this.x - px, 2) + Math.pow(this.y - py, 2)) <= this.sprite.height / 2
    }
    public release() {
        let container = Screen.init().getContainer()
        container.removeChild(this.sprite)
    }
}