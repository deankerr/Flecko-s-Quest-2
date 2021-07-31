import Phaser from 'phaser'

class GameScene extends Phaser.Scene
{
    constructor() {
      super({ key: 'gameScene'})
    }

    init() {
        this.gameW = this.sys.game.config.width;
        this.gameH = this.sys.game.config.height;

        this.cursors = this.input.keyboard.createCursorKeys()

        this.playerSpeed = 250
        this.playerShootDelay = 20
    }

    create() {        
        // Audio
        this.walk = this.sound.add('walk')

        // Background
        this.bg1 = this.physics.add.sprite(0, 0, 'background')
        this.bg1.setRotation(3 * Math.PI / 2)
        this.bg1.setOrigin(1, 0)
        this.bg1.setImmovable(true)

        this.bg2 = this.physics.add.sprite(0, 0 - 639, 'background')
        this.bg2.setRotation(3 * Math.PI / 2)
        this.bg2.setOrigin(1, 0)
        this.bg2.setFlipY(true)
        this.bg2.setImmovable(true)

        this.setBgSpeed(50)
        
        // Player
        this.player = this.physics.add.sprite(this.gameW / 2, this.gameH - 100, 'player')
            .setScale(0.5).setCollideWorldBounds()

        // Player bullets
        this.playerBullets = this.physics.add.group()
        this.playerbulletTimeout = 0

        // Enemies
        this.enemies = this.physics.add.group()

        this.time.addEvent({
            delay: 1000,
            loop: true,
            callbackScope: this,
            callback: () => {
                this.createEnemy()
            }
        })

        // Overlap checks
        this.physics.add.overlap(this.playerBullets, this.enemies, this.enemyHit, null, this)
        this.physics.add.overlap(this.enemies, this.player, this.playerHit, null, this)

    }

    update() {
        this.updateBackground()
        this.updatePlayer()
        this.removeOffScreenBullets()
        this.removeOffScreenEnemies()

    }

    createEnemy() {
        // console.log(`Creating enemy. Pool: ${this.enemies.getLength()}`)
        const enemyX = Math.random() * this.gameW
        const enemyY = -30
        let enemy = this.enemies.get(enemyX, enemyY, 'dragon')
        enemy.setScale(.5)
        
        enemy.setActive(true).setVisible(true)
        enemy.body.enable = true

        enemy.setVelocityY(this.randBtn(150, 200))
    }

    enemyHit(bullet, enemy) {
        console.log('Enemy hit')
        this.playerBullets.killAndHide(bullet)
        bullet.disableBody()

        this.enemies.killAndHide(enemy)
        enemy.disableBody()
    }

    updatePlayer() {
        if (this.cursors.left.isDown) {
            this.player.body.setVelocityX(-this.playerSpeed);
            this.player.setFlipX(true)
            this.playWalk()
        }
        else if (this.cursors.right.isDown) {
            this.player.body.setVelocityX(this.playerSpeed)
            this.player.setFlipX(false)
            this.playWalk()
        }
        else {
            this.player.body.setVelocityX(0)
        }

        if (this.cursors.up.isDown) {
            this.player.body.setVelocityY(-this.playerSpeed);
            this.playWalk()
        }
        else if (this.cursors.down.isDown) {
            this.player.body.setVelocityY(this.playerSpeed)
            this.playWalk()
        }
        else {
            this.player.body.setVelocityY(0)
        }

        if (!this.cursors.right.isDown && !this.cursors.left.isDown && !this.cursors.up.isDown && !this.cursors.down.isDown) {
            this.stopWalk()
        }

        if (this.playerbulletTimeout > 0) this.playerbulletTimeout--

        if (this.cursors.space.isDown) {
            if (this.playerbulletTimeout === 0) this.createPlayerBullet()
        }
 
    }

    playerHit(enemy) {
        console.log('ow')
    }

    createPlayerBullet() {
        // console.log('creating player bullet')
        let bullet = this.playerBullets.get(this.player.x, this.player.y, 'treasure')
        .setScale(.4).setRotation(3 * Math.PI / 2)
        
        Math.random() > .5 ? bullet.setFlipY(true) : bullet.setFlipY(false)
        bullet.setActive(true).setVisible(true)
        bullet.enableBody()
        bullet.setVelocityY(-400)

        this.playerbulletTimeout = this.playerShootDelay
        // console.log(`Player bullets pool: ${this.playerBullets.getLength()}`)
    }

    removeOffScreenBullets() {
        this.playerBullets.getChildren().forEach((bullet) => {
            if (bullet.active && this.isOffScreen(bullet)) {
                // console.log(`Killing bullet x: ${bullet.x}  y: ${bullet.y}`)
                this.playerBullets.killAndHide(bullet)
                bullet.disableBody()
            }
        }, this)
    }

    removeOffScreenEnemies() {
        this.enemies.getChildren().forEach((enemy) => {
            if (enemy.active && this.isOffScreen(enemy)) {
                // console.log(`Killing enemy x: ${enemy.x}  y: ${enemy.y}`)
                this.enemies.killAndHide(enemy)
                enemy.disableBody()
            }
        }, this)
    }

    isOffScreen(obj) {
        if (obj.x < -this.gameW || obj.x > this.gameW * 2 || obj.y < -this.gameW || obj.y > this.gameW * 2) return true
        else return false
    }
    playWalk() {
        if (!this.walk.isPlaying) {
        this.walk.play({loop: true})
        }
    }

    stopWalk() {
        this.walk.stop()    
    }

    updateBackground() {
        if (this.bg1.y >= this.bg1.width) this.bg1.y = -this.bg1.width + 1
        if (this.bg2.y >= this.bg2.width) this.bg2.y = -this.bg2.width + 1
    }

    setBgSpeed(speed) {
       this.bg1.setVelocityY(speed)
       this.bg2.setVelocityY(speed)
    }

    randBtn(min, max) {
        return Math.floor(Math.random() * (max - min + 1) + min)
    }
}

export default GameScene
