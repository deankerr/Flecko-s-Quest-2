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

        // Fireball animation
        if(!this.anims.get('fireball')) {
            // fire animation
            this.anims.create({
              key: 'fireball',
              frames: this.anims.generateFrameNames('fireball', {
                frames: [0, 1]
              }),
              frameRate: 10,
              repeat: -1
            });
        }

        // Background
        let bg1 = this.physics.add.sprite(0, 0, 'background')
        bg1.setOrigin(0, 0)
        bg1.setScale(1.5)
        // bg1.setTint(0xFF0000)

        let bg2 = this.physics.add.sprite(0, 0, 'background')
        bg2.setOrigin(0, 0)
        bg2.setScale(1.5)
        bg2.setFlipX(true)
        // bg2.setTint(0x00FF00)

        let bg3 = this.physics.add.sprite(0, 0, 'background')
        bg3.setOrigin(0, 0)
        bg3.setScale(1.5)

        bg1.prev = bg3
        bg2.prev = bg1
        bg3.prev = bg2

        bg1.y = this.gameH - bg1.displayHeight
        bg2.y = bg1.y - bg2.displayHeight
        bg3.y = bg2.y - bg3.displayHeight

        this.bg = [bg1, bg2, bg3]
        this.setBgSpeed(50)

        // acelleration test
        this.bg.forEach((bg) => {
            bg.setAccelerationY(1)
        })
        
        // Player
        this.player = this.physics.add.sprite(this.gameW / 2, this.gameH - 100, 'player')
            .setScale(0.5).setCollideWorldBounds()
        this.player.setBodySize(24, 24, true)

        // Player bullets
        this.playerBullets = this.physics.add.group()
        this.playerbulletTimeout = 0

        // Enemies
        this.enemies = this.physics.add.group()
        this.enemyBullets = this.physics.add.group()

        // Overlap checks
        // player bullets hit enemies
        this.physics.add.overlap(this.playerBullets, this.enemies, this.enemyHit, null, this)
        // enemy bodies hit player
        this.physics.add.overlap(this.enemies, this.player, this.playerHit, null, this)
        // enemy bullet hit player
        this.physics.add.overlap(this.enemyBullets, this.player, this.playerHitByBullet, null, this)

        // CREATE RANDOM ENEMIES
        this.time.addEvent({
            delay: 1000,
            loop: true,
            callbackScope: this,
            callback: () => {
                let rndE = this.randBetween(1, 3)
                switch (rndE) {
                    case 1:
                        this.createEnemy()
                        break
                    case 2:
                        this.createEnemy2()
                        break
                    case 3:
                        this.createEnemy3()
                }
            }
        })

        // POOL SIZE DEBUG
        const debugPoolSizeEvent = this.time.addEvent({
            delay: 10000,
            loop: true,
            callbackScope: this,
            callback: () => {
                console.log(`Pbul: ${this.playerBullets.getLength()} E: ${this.enemies.getLength()} Ebul: ${this.enemyBullets.getLength()}`)}
        })

        // CREATE TEST ENEMY DEBUG
        let testEnemy = this.createEnemy(this.gameH/2, 200)
        testEnemy.setVelocityX(0).setVelocityY(0)

        // CREATE TEST ENEMY2 DEBUG
        let testEnemy2 = this.createEnemy2(this.gameW/2, this.gameH/2)
        testEnemy2.setVelocityY(0)

        // CREATE TEST ENEMY3 DEBUG
        let testEnemy3 = this.createEnemy3(this.gameW/2 + 100, this.gameH / 2)
        testEnemy3.setVelocityY(0)

        // get key
        this.keyP = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.P);
    }

    update() {
        this.updateBackground()
        this.updatePlayer()
        this.removeOffScreenBullets()
        this.removeOffScreenEnemies()

        if (Phaser.Input.Keyboard.JustDown(this.keyP)) {
            if (this.physics.world.isPaused) {
                this.physics.world.resume()
            } else {
                this.physics.world.pause()
            }
        }
    }

    createEnemy(x = null, y = null) {
        let enemy = this.enemies.get(0, 0, 'dragon')
        enemy.setScale(.5)
        enemy.setActive(true).setVisible(true)
        enemy.body.enable = true
        enemy.setBodySize(45, 45, true)
        enemy.clearTint()

        const enemyX = x ? x : this.randBetween(0 + enemy.displayWidth / 2 + 1, this.gameW - enemy.displayWidth / 2 - 1)
        const enemyY = y ? y : -30
        enemy.x = enemyX
        enemy.y = enemyY

        enemy.setVelocityY(this.randBetween(150, 200))

        enemy.shootTimeout = 1000
        enemy.fire = () => {
            let bullet = this.createEnemyBullet(enemy)
            this.seekPlayer(bullet, 200)
        }

        enemy.nextShootEvent = this.time.addEvent({
            delay: enemy.shootTimeout,
            loop: true,
            callbackScope: this,
            callback: () => {
                enemy.fire()
            }
        })

        return enemy
    }

    createEnemy2(x = null, y = null) {
        let enemy = this.createEnemy(x, y)
        enemy.setScale(.6)
        // enemy.setBodySize(50, 50, true)
        enemy.setVelocityY(this.randBetween(100, 250))
        enemy.setTint(0xFF6600)

        enemy.fire = () => {
            let bullets = []
            for (let i = 0; i < 5; i++) {
                bullets.push(this.createEnemyBullet(enemy))
            }
            this.seekPlayerShotgun5(enemy, bullets, 200)
        }

        return enemy
    }

    createEnemy3(x = null, y = null) {
        let enemy = this.createEnemy(x, y)
        enemy.setScale(.7)
        // enemy.setBodySize(50, 50, true)
        enemy.setVelocityY(this.randBetween(50, 100))
        enemy.setTint(0x4422FF)
        enemy.shootTimeout = 2000

        enemy.fire = () => {
            this.time.addEvent({
                delay: 50,
                repeat: 12,
                callbackScope: this,
                callback: () => {
                    let bullet = this.createEnemyBullet(enemy)
                    this.seekPlayer(bullet, 200)
                }
            })
        }

        enemy.nextShootEvent.reset({
            delay: enemy.shootTimeout,
            loop: true,
            callbackScope: this,
            callback: () => {
                enemy.fire()
            }
        })

        return enemy
    }

    createEnemyBullet(origin) {
        let bullet = this.activate(this.enemyBullets.get(origin.x, origin.y, 'fireball').setScale(2))
            bullet.setBodySize(4, 4, true)
            bullet.anims.play('fireball')

        return bullet
    }

    enemyHit(bullet, enemy) {
        console.log('Enemy hit')
        this.disableSprite(bullet, this.playerBullets)
        this.disableSprite(enemy, this.enemies)
    }

    disableSprite(sprite, group) {
        if (group) group.killAndHide(sprite)
        sprite.disableBody()   
        if (sprite.nextShootEvent) sprite.nextShootEvent.remove()
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
        console.log('ow enemy body')
    }

    playerHitByBullet(player, bullet) {
        console.log('ow bullet')
        this.disableSprite(bullet, this.enemyBullets)
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

        this.enemyBullets.getChildren().forEach((bullet) => {
            if (bullet.active && this.isOffScreen(bullet)) {
                // console.log(`Killing bullet x: ${bullet.x}  y: ${bullet.y}`)
                this.enemyBullets.killAndHide(bullet)
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
                enemy.nextShootEvent.paused = true
            }
        }, this)
    }

    isOffScreen(obj) {
        if (obj.x < -this.gameW || obj.x > this.gameW * 2 || obj.y < -this.gameH || obj.y > this.gameH + obj.displayHeight) return true
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
        this.bg.forEach((bg) => {
            if (bg.y >= this.gameH) {
            // console.log('returning')
            bg.y = bg.prev.y - bg.displayHeight
            bg.x = this.randBetween(this.gameW - bg.displayWidth, 0)
            }
        })
    }

    setBgSpeed(speed) {
       this.bg.forEach((bg) => {
           bg.setVelocityY(speed)
       })
    }

    randBetween(min, max) {
        return Math.floor(Math.random() * (max - min + 1) + min)
    }

    activate(obj) {
        return obj.setActive(true).setVisible(true).enableBody()
    }

    seekPlayer(obj, speed) {
        const targetAngle = Phaser.Math.Angle.Between(obj.x, obj.y, this.player.x, this.player.y)
        obj.setVelocityX(Math.cos(targetAngle) * speed)
        obj.setVelocityY(Math.sin(targetAngle) * speed)
    }

    seekPlayerShotgun5(obj, bullets, speed) {
        const targetAngle = Phaser.Math.Angle.Between(obj.x, obj.y, this.player.x, this.player.y)
        bullets[0].setVelocityX(Math.cos(targetAngle - .15) * speed)
        bullets[0].setVelocityY(Math.sin(targetAngle - .15) * speed)

        bullets[1].setVelocityX(Math.cos(targetAngle - .075) * speed)
        bullets[1].setVelocityY(Math.sin(targetAngle - .075) * speed)

        this.seekPlayer(bullets[2], speed)

        bullets[3].setVelocityX(Math.cos(targetAngle + .075) * speed)
        bullets[3].setVelocityY(Math.sin(targetAngle + .075) * speed)

        bullets[4].setVelocityX(Math.cos(targetAngle + .15) * speed)
        bullets[4].setVelocityY(Math.sin(targetAngle + .15) * speed)
    }
}

export default GameScene
