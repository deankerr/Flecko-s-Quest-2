import Phaser from 'phaser'

export default class PauseMan extends Phaser.Scene {
    constructor() {
        super({ key: 'pauseMan'})
    }

    create() {
        this.paused = false
        this.gameScene = this.scene.get('gameScene')

        this.keyP = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.P)
        console.log('pauseman init')
    }

    update() {
        if (Phaser.Input.Keyboard.JustDown(this.keyP)) {
            console.log('p')
            if (this.paused) {
                this.paused = false
                this.gameScene.sys.resume()
                this.events.emit('resumeBgm')

                console.log('game resumed')
            } else {
                this.paused = true
                this.gameScene.sys.pause()
                this.events.emit('pauseBgm')
                console.log('game paused')
            }
        }
    }
}
