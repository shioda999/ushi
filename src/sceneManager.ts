import * as PIXI from "pixi.js"
import { Title } from './Title'
import { Key } from './key'
import { SceneType, Scene } from './Scene'
import { Fade } from './Fade'
import { GraphicManager } from './GraphicManager'
import { Sound } from './Sound'
import { Game } from "./Game"
import { GRAPH_FNAME } from './global'
export class SceneManager {
    private key: Key
    private static instance: SceneManager
    private sceneName: SceneType[] = []
    private scene
    private constructor(private container: PIXI.Container) {
        Scene.SetGotoSceneFunction((v) => this.gotoScene(v), this.exitCurrentScene)
        const inst = GraphicManager.GetInstance()
        inst.loadGraphics(GRAPH_FNAME)
        Sound.load("sound\\bgm.mp3", "bgm")
        Sound.load("sound\\boo.mp3", "boo")
        Sound.load("sound\\jump.mp3", "jump")
        Sound.load("sound\\fall.mp3", "fall")
        Sound.load("sound\\damage.mp3", "damage")
        Sound.load("sound\\decide.mp3", "decide")
        Sound.load("sound\\back.mp3", "back")
        Sound.load("sound\\game_over.mp3", "over")

        this.key = Key.GetInstance()
        this.key.key_register({ code: ["Enter", "PadA"], name: "decide" })
        this.key.key_register({ code: ["Backspace", "PadB"], name: "cancel" })
        this.key.key_register({ code: ["r"], name: "r" })
        this.gotoScene("title")
    }
    public static init(container: PIXI.Container) {
        if (!this.instance)
            this.instance = new SceneManager(container);
        return this.instance;
    }
    private exitCurrentScene = () => {
        this.sceneName.pop()
    }
    private gotoScene(name: SceneType) {
        if (name === "back") {
            name = this.sceneName.pop()
            if (this.sceneName.length > 0) name = this.sceneName.pop()
        }
        this.sceneName.push(name)
        if (this.scene) {
            if (this.scene.release !== undefined) this.scene.release()
            delete this.scene
        }
        const fade = new Fade(this.container, () => {
            this.container.removeChildren()
            this.scene = new {
                title: Title,
                game: Game,
            }[name](this.container)
        })
    }
}