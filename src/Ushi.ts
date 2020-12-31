import * as PIXI from "pixi.js"
import { Scene } from './Scene';
import { WIDTH, HEIGHT, GlobalParam, G, POS_X } from './global'
import { Key } from './key'
import { Screen } from './Screen'
import { GraphicManager } from './GraphicManager'
import { Ground } from "./Ground";
import { Sound } from "./Sound";
const JUMP = 15
const JUMP_COUNT = 2
const BUTTON_W = WIDTH / 12
const BUTTON_H = HEIGHT / 16
const style = new PIXI.TextStyle({
    fill: [
        "#d6d6d6",
    ],
    fontFamily: "Arial Black",
    fontSize: 25,
    fontWeight: "bold",
    letterSpacing: 2,
    miterLimit: 1,
    padding: 40,
    textBaseline: "middle"
});

export class Ushi {
    private key: Key
    private x: number = POS_X
    private y: number = HEIGHT / 4
    private vx: number = 0
    private vy: number = 0
    private ax: number = 0
    private ay: number = 0
    private sprite: PIXI.Sprite
    private landing: boolean = false
    private jumping: boolean = false
    private jump_count: number = 0
    private jump_button: PIXI.Container
    private is_click: boolean = false
    private prev_key_state: boolean = false
    constructor(private ground: Ground) {
        this.key = Key.GetInstance()

        let graph = GraphicManager.GetInstance()
        this.sprite = graph.GetSprite("ushi")

        let container = Screen.init().getContainer()
        container.addChild(this.sprite)
        this.sprite.anchor.set(0.5)
        this.sprite.position.set(this.x, this.y)
        this.set_jump_button()
    }
    private set_jump_button() {
        let container = Screen.init().getContainer()
        this.jump_button = new PIXI.Container()
        this.jump_button.position.set(WIDTH * 0.9, HEIGHT * 0.9)
        let button = new PIXI.Graphics()
        button.lineStyle(2, 0xcc0000, 1, 1)
        button.beginFill(0xffffcc, 0.5)
        button.drawEllipse(-BUTTON_W / 2, -BUTTON_H / 2, BUTTON_W, BUTTON_H)
        button.endFill()

        let text = new PIXI.Text("JUMP", style)
        text.position.set(-text.width * 0.775, -text.height * 1.2)

        this.jump_button.addChild(button)
        this.jump_button.addChild(text)

        this.jump_button.interactive = true
        this.jump_button.on('pointerdown', this.onclick)
        this.jump_button.on('pointerup', this.offclick)

        container.addChild(this.jump_button)
    }
    private onclick = () => {
        this.jump()
        this.is_click = true
    }
    private offclick = () => {
        this.is_click = false
    }
    public update() {
        this.ay = G
        this.vx += this.ax
        this.vy += this.ay
        if (this.jumping) this.vy = -JUMP, this.jumping = false
        let prev_y = this.y
        this.x += this.vx
        this.y += this.vy
        if (prev_y <= this.ground.get_groundHeight(this.x) + 10 && this.y > this.ground.get_groundHeight(this.x)) {
            this.landing = true
            this.y = this.ground.get_groundHeight(this.x)
            this.vy = 0
            this.jump_count = 0
        }
        else this.landing = false
        this.sprite.position.set(this.x, this.y - this.sprite.height / 2)

        if (this.prev_key_state == false && this.key.IsPress_Now("decide")) {
            this.jump()
            this.prev_key_state = true
        }
        if (this.prev_key_state == true && !this.key.IsPress_Now("decide")) {
            this.prev_key_state = false
        }

        if (this.key.IsPress_Now("decide") || this.is_click) {
            this.jump_button.alpha = 0.8
        }
        else this.jump_button.alpha = 1.0
    }
    public check_fall() {
        return this.y > HEIGHT * 1.3
    }
    private jump() {
        if (this.jump_count < JUMP_COUNT) {
            this.jumping = true
            this.jump_count++
            Sound.play("jump", false, GlobalParam.se_volume)
        }
    }
    public getx() {
        return this.x
    }
    public gety() {
        return this.y
    }
    public release() {
        let container = Screen.init().getContainer()
        this.jump_button.removeChildren()
        container.removeChild(this.jump_button)
        container.removeChild(this.sprite)
    }
}