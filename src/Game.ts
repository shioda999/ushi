import * as PIXI from "pixi.js"
import { Scene } from './Scene';
import { WIDTH, HEIGHT, GlobalParam, POS_X } from './global'
import { Key } from './key'
import { Ushi } from './Ushi'
import { GraphicManager } from './GraphicManager'
import { Sound } from './Sound'
import { BackGround } from "./BackGround";
import { Enemy } from "./Enemy";
import { GameOver } from './GameOver'
import { Ground } from "./Ground";
const FPS_UPDATE_FREQ = 20
const text_style = new PIXI.TextStyle({
    fontFamily: "Arial",
    fontSize: 16,
    fill: [0xffffff]
})
export class Game extends Scene {
    private score_text: PIXI.Text
    private stage: number = 1
    private curTime: number
    private prevTime: number
    private countFrame: number = 0
    private key: Key
    private fpsContainer: PIXI.Container
    private fpsText: PIXI.Text
    private fpsBox: PIXI.Graphics
    private releaseFlag: boolean = false
    private score: number = 0
    private time: number = 0
    //private background: BackGround
    private ushi: Ushi
    private enemys: Enemy[] = []
    private ground: Ground
    constructor(private container: PIXI.Container) {
        super()
        this.release = () => {
            this.releaseFlag = true
            Sound.stop("bgm")
        }
        //this.background = new BackGround(container, this.stage)
        const inst = GraphicManager.GetInstance()
        inst.SetLoadedFunc(() => {
            this.ground = new Ground()
            this.ushi = new Ushi(this.ground)
            this.key = Key.GetInstance()
            this.curTime = new Date().getTime() - 1000 * FPS_UPDATE_FREQ / 60
            this.initFpsContainer()
            this.loop()
        })
        Sound.play("bgm", true, GlobalParam.bgm_volume)
    }
    private obj_update() {
        this.ground.update()
        this.ushi.update()
        this.enemys.forEach(n => n.update())
        if (this.ground.generate_enemy()) {
            let e = new Enemy(this.ground)
            this.enemys.push(e)
        }
        if (this.check_collision()) {
            Sound.stop("bgm")
            Sound.play("damage", false, GlobalParam.se_volume * 2)
            this.gameover()
            this.releaseFlag = true
        }
        if (this.ushi.check_fall()) {
            Sound.stop("bgm")
            Sound.play("fall", false, GlobalParam.se_volume)
            this.gameover()
            this.releaseFlag = true
        }
    }
    private check_collision() {
        let px = this.ushi.getx(), py = this.ushi.gety()
        let flag: boolean = false
        this.enemys.forEach(n => {
            if (n.collision(px, py)) flag = true
        })
        return flag
    }
    private gameover() {
        GlobalParam.data.score = this.score
        new GameOver(this.container, () => {
            Sound.stop("all")
            Sound.play("decide", false, GlobalParam.se_volume)
            this.exitCurrentScene()
            this.gotoScene("title")
        })
    }
    private loop = () => {
        if (this.releaseFlag) return
        requestAnimationFrame(this.loop)
        if (GlobalParam.pause_flag) return
        if (this.time % 10 == 0) this.AddScore(1)
        this.key.RenewKeyData()
        //this.background.update()
        this.obj_update()
        this.update_score_text()
        if (this.countFrame % FPS_UPDATE_FREQ === 0) {
            this.prevTime = this.curTime
            this.curTime = new Date().getTime()
            this.updateFPS(this.curTime - this.prevTime)
        }
        this.countFrame++
        this.time++
        if (this.key.IsPress("cancel")) {
            Sound.play("cancel", false, GlobalParam.se_volume)
            this.gotoScene("back")
        }
    }
    private AddScore = (score: number) => {
        this.score += score
    }
    private orgRound(value, base) {
        return Math.round(value * base) / base;
    }
    private updateFPS(delta: number) {
        this.fpsContainer.removeChildren()
        if (this.fpsText) this.fpsText.destroy()
        if (this.fpsBox) this.fpsBox.destroy()
        this.fpsText = new PIXI.Text("FPS:" + this.orgRound(1000 * FPS_UPDATE_FREQ / delta, 100).toFixed(2), {
            fontFamily: "Arial", fontSize: WIDTH / 30, fill: 0xdddddd
        })
        this.fpsBox = new PIXI.Graphics()
        this.fpsBox.lineStyle(2, 0xcccccc, 1, 1.0)
        this.fpsBox.beginFill(0x0000ff, 0.3)
        this.fpsBox.drawRect(0, 0, this.fpsText.width, this.fpsText.height)
        this.fpsBox.endFill()
        this.fpsContainer.addChild(this.fpsBox)

        this.fpsContainer.addChild(this.fpsText)
        this.fpsContainer.x = WIDTH - this.fpsText.width - 3
        this.fpsContainer.y = 3
    }
    private initFpsContainer() {
        this.fpsContainer = new PIXI.Container()
        this.fpsContainer.zIndex = 1
        this.container.addChild(this.fpsContainer)
    }
    private update_score_text() {
        this.container.removeChild(this.score_text)
        this.score_text = new PIXI.Text(" score : " + this.score, text_style)
        this.score_text.position.set(0, HEIGHT)
        this.score_text.anchor.x = 0
        this.score_text.anchor.y = 1.0
        this.container.addChild(this.score_text)
    }
}