import Phaser from 'phaser'

export default class SoundScene extends Phaser.Scene {
    constructor() {
        super({ key: 'soundScene'})
    }

    init() {
        this.gameScene = this.scene.get('gameScene')
        this.fire1Max = 3
        this.fire2Max = 2
        this.fire3Max = 4
    }

    create() {
        this.fire1 = []
        for (let i = 0; i < this.fire1Max; i++) {
            this.fire1[i] = this.sound.add('fire1')
        }

        this.fire2 = []
        for (let i = 0; i < this.fire2Max; i++) {
            this.fire2[i] = this.sound.add('fire2')
        }

        this.fire3 = []
        for (let i = 0; i < this.fire3Max; i++) {
            this.fire3[i] = this.sound.add('fire3')
        }

        this.yell = []
        this.yell.push(this.sound.add('yell1'))
        this.yell.push(this.sound.add('yell2'))
        this.yell.push(this.sound.add('yell3'))
        this.yell.push(this.sound.add('yell4'))

        this.gameScene.events.on('playFire1', () => { this.play(this.fire1) })
        this.gameScene.events.on('playFire2', () => { this.play(this.fire2) })
        this.gameScene.events.on('playFire3', () => { this.play(this.fire3) })
        this.gameScene.events.on('playerDie', this.playerDie, this)
    }

    play(sound) {
        let s = this.getAvailableSound(sound)
    }

    getAvailableSound(sound) {
        sound.every((s, i) => {
            if (!s.isPlaying) {
                s.play()
                return false
            } else return true
        })
    }

    playerDie() {
        const rand = Math.floor(Math.random() * 4)
        this.yell[rand].play()
    }
}
