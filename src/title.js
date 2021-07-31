import Phaser from 'phaser'

import backgroundImg from './assets/background.png'
import dragonImg from './assets/dragon.png'
import playerImg from './assets/player.png'
import treasureImg from './assets/treasure.png'

// import mindmazeAudio from './assets/mindmaze.mp3'
// import funkyAudio from './assets/funky.mp3'

import yell1Audio from './assets/nuyell1.wav'
import yell2Audio from './assets/nuyell3.wav'
import yell3Audio from './assets/nuyell4.wav'
import yell4Audio from './assets/nuyell5.wav'

import toddAudio from './assets/walk.mp3'
 
class TitleScene extends Phaser.Scene {
  constructor() {
    super({ key: 'titleScene'})
  }

  preload() {
    let gameW = this.sys.game.config.width
    let gameH = this.sys.game.config.height
    this.loadText = this.add.text(gameW/2, gameH/2, 'Now Loading...', {
      fontFamily: 'sans-serif',
      fontSize: '16px',
      fill: '#ffffff'
    })
    this.loadText.setOrigin(0.5, 0.5)

    this.load.image('background', backgroundImg)
    this.load.image('dragon', dragonImg)
    this.load.image('player', playerImg)
    this.load.image('treasure', treasureImg)

    // this.load.audio('mindmaze', mindmazeAudio)
    // this.load.audio('funky', funkyAudio)

    // this.load.audio('yell1', yell1Audio)
    // this.load.audio('yell2', yell2Audio)
    // this.load.audio('yell3', yell3Audio)
    // this.load.audio('yell4', yell4Audio)

    this.load.audio('walk', toddAudio)
  }

  create() {
    // TESTING: skip title screen
    this.scene.start('gameScene')

    this.loadText.destroy()
    
    let gameW = this.sys.game.config.width
    let gameH = this.sys.game.config.height
    let text = this.add.text(gameW/2, gameH/2 - 50, 'Flecko\'s Quest', {
      fontFamily: 'Fondamento, Arial',
      fontSize: '88px',
      fill: '#ffffff'
    });
    text.setOrigin(0.5, 0.5)
    text.depth = 1

    let beginText = this.add.text(gameW/2, gameH/2 + 70, 'Begin Your Quest', {
      fontFamily: 'Fondamento, Arial',
      fontSize: '40px',
      fill: '#ffffff'
    });
    beginText.setOrigin(0.5, 0.5);

    let btnX = beginText.x - beginText.width/2 - 20
    let btnY = beginText.y - beginText.height/2 - 10
    let btnW = beginText.width + 40
    let btnH = beginText.height + 20

    let textBg = this.add.graphics()
    textBg.setDepth(-1)
    textBg.fillStyle(0x000000, 0.7)
    textBg.fillRect(btnX, btnY, btnW, btnH)
    textBg.setInteractive(new Phaser.Geom.Rectangle(btnX, btnY, btnW, btnH), Phaser.Geom.Rectangle.Contains)

    textBg.on('pointerdown', function(){
      this.scene.start('gameScene')
      // this.scene.launch('bgmScene')
    }, this);
  }
}

export default TitleScene
