import Phaser from 'phaser'

export default class UiScene extends Phaser.Scene {
    constructor() {
        super({ key: 'uiScene'})
    }

    init() {
        this.gameScene = this.scene.get('gameScene')
        this.margin = 50
        this.gameW = this.sys.game.config.width
        this.gameH = this.sys.game.config.height

        this.healthX = 24
        this.healthY = this.gameH - 50 - 24
        this.healthW = 250
        this.healthH = 50
    }

    create() {
        // Health Bar
        let healthUI = this.add.container(this.healthX, this.healthY)
        this.healthUI = healthUI

        let healthBg = this.add.graphics()
        healthBg.fillStyle(0x000000, 0.7)
        // healthBg.fillRect(0, 0, this.healthW, this.healthH)
        healthBg.fillRoundedRect(0, 0, this.healthW, this.healthH, 5)
        healthUI.add(healthBg)

        let heartImg = this.add.sprite(0, 0, 'heart')
        heartImg.setPosition(24, this.healthH / 2)
        heartImg.setScale(.5)
        healthUI.add(heartImg)

        let healthBar = this.add.graphics()
        healthBar.fillStyle(0xFF0000)
        healthBar.offsetX = heartImg.x + heartImg.displayWidth / 2 + 5
        healthBar.maxW = this.healthW - healthBar.offsetX - 10
        healthBar.H = this.healthH - 20
        healthBar.fillRoundedRect(healthBar.offsetX, 10, healthBar.maxW, healthBar.H, 4)
        healthUI.add(healthBar)
        this.healthBar = healthBar

        // Events
        this.gameScene.events.on('playerHealth', this.updateHealth, this)
    }

    updateHealth(player) {
        let healthBar = this.healthBar
        const healthPerc = healthBar.maxW * this.capToZero(player.health / player.maxHealth)
        healthBar.clear()
        if (healthPerc > 0) {
            healthBar.fillStyle(0xFF0000)
            healthBar.fillRoundedRect(healthBar.offsetX, 10, healthPerc, healthBar.H, 4)
        }
    }

    capToZero(exp) {
        if (exp < 0) return 0
        return exp
    }
} 
