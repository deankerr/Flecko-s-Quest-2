import Phaser from 'phaser'

class BgmScene extends Phaser.Scene {
  constructor() {
    super({ key: 'bgmScene'})
  }

  init() {
    this.gameScene = this.scene.get('gameScene')
  }

  create() {
    this.bgm = this.sound.add('mindmaze')
    // this.bgm.play({loop: true})
    
    this.gameScene.events.on('stopBgm', () => {
      this.bgm.stop()
    })

    this.gameScene.events.on('playBgm', () => {
      // if (!this.bgm.isPlaying) this.bgm.play({loop: true})
    })
  }
}

export default BgmScene
