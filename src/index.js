import Phaser from 'phaser'
import GameScene from './game'
import TitleScene from './title'
import BgmScene from './bgm'

const config = {
    type: Phaser.AUTO,
    parent: 'game',
    width: 720,
    height: 640,
    scene: [TitleScene, GameScene, BgmScene],
    physics: {
        default: 'arcade',
        arcade: {
            debug: false
        }
    },
    pixelArt: true,
    backgroundColor: 0x849B2F
};

const game = new Phaser.Game(config)
