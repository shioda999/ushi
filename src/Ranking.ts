import * as PIXI from "pixi.js"
import { WIDTH, HEIGHT, GlobalParam, save } from './global'
import { Key } from './key'
import { Sound } from './Sound'
import { ItemManager } from "./ItemManager";
import { Screen } from 'Screen'
const FPS_UPDATE_FREQ = 20
const style = new PIXI.TextStyle({
    align: "center",
    dropShadow: true,
    dropShadowAngle: 6.7,
    dropShadowBlur: 14,
    dropShadowColor: "#571600",
    dropShadowDistance: 0,
    fill: [
        "red",
        "#8f0000"
    ],
    fillGradientStops: [
        0.6,
        1
    ],
    fontFamily: "Georgia",
    fontSize: 82,
    fontVariant: "small-caps",
    letterSpacing: 5,
    lineJoin: "round",
    miterLimit: 1,
    stroke: "#571600",
    strokeThickness: 12,
    whiteSpace: "normal"
});
export class Ranking {
    private count: number
    private releaseFlag: boolean
    private text: PIXI.Text
    private graphic: PIXI.Graphics
    private container: PIXI.Container
    constructor(private data: any) {
        this.container = Screen.init().
            this.graphic = new PIXI.Graphics()

    }
    private loop = () => {
        if (this.releaseFlag) return
        requestAnimationFrame(this.loop)
        this.count++
        Key.GetInstance().RenewKeyData()

        if (this.count >= 30 && this.count < 120 && Key.GetInstance().IsPress("decide")) {
            this.count = 120, this.text.y = HEIGHT / 2 - 150
        }
        if (this.count < 60) this.text.alpha = Math.min(this.count / 30, 1.0)
        else if (this.count < 110) {
            this.text.y -= 3
        }
        else if (this.count == 120) {
            this.item_manager = new ItemManager(WIDTH / 2, HEIGHT * 0.7, WIDTH / 3, HEIGHT / 10, this.container,
                this.decide, undefined)
            this.item_manager.appendItem("Title", HEIGHT / 10, [0xffffff, 0xcccccc, 0x555555])

            if (GlobalParam.highScore < GlobalParam.data.score) {
                GlobalParam.highScore = GlobalParam.data.score
            }
            save()
            const text = new PIXI.Text("High Score : " + GlobalParam.highScore
                + "\nYour Score : " + GlobalParam.data.score,
                new PIXI.TextStyle({
                    dropShadowAlpha: 0.2,
                    fill: "white",
                    fillGradientType: 1,
                    fillGradientStops: [
                        1,
                        0
                    ],
                    fontFamily: "Arial Black",
                    fontSize: 20,
                    fontWeight: "bold",
                    lineJoin: "round",
                    miterLimit: 1,
                    strokeThickness: 5,
                    textBaseline: "middle"
                }))
            this.score_text = text
            text.alpha = 0
            this.container.addChild(text)
            text.position.set((WIDTH - text.width) / 2, HEIGHT / 2.2)
        }
        else {
            if (this.score_text) this.score_text.alpha = Math.min(1.0, 1.0 + (this.count - 160) / 40)
            if (this.item_manager) this.item_manager.update()
        }
    }
    private decide = () => {
        this.func()
        this.releaseFlag = true
    }
    public release() {
        this.item_manager.delete()
        this.container.removeChild(this.graphic)
        this.container.removeChild(this.score_text)
    }
}