import Phaser from 'phaser'

class BgmScene extends Phaser.Scene {
  constructor() {
    super({ key: 'bgmScene'})
  }

  init() {
    this.gameScene = this.scene.get('gameScene')
    this.pauseMan = this.scene.get('pauseMan')
  }

  create() {
    this.bgm = this.sound.add('road')
    this.bgm.play({loop: true})
    
    this.gameScene.events.on('stopBgm', () => {
      this.bgm.stop()
    })

    this.gameScene.events.on('playBgm', () => {
      if (!this.bgm.isPlaying) this.bgm.play({loop: false})
    })

    this.pauseMan.events.on('pauseBgm', () => this.bgm.pause())

    this.pauseMan.events.on('resumeBgm', () => this.bgm.resume())
  }
}

export default BgmScene
