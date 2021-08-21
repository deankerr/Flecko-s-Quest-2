import Phaser from 'phaser'
import PowerUp from './powerUp'
import stages from './stages'
import StageManager from './StageManager'

class GameScene extends Phaser.Scene
{
    constructor() {
      super({ key: 'gameScene'})
    }

    init() {
        this.gameW = this.sys.game.config.width
        this.gameH = this.sys.game.config.height

        this.cursors = this.input.keyboard.createCursorKeys()

        this.playerSpeed = 250
        this.playerShootDelay = 20
        this.playerMaxHealth = 10
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
              frameRate: 12,
              repeat: -1
            });
        }

        // death animation
        if(!this.anims.get('cloud')) {
            this.anims.create({
              key: 'cloud',
              frames: this.anims.generateFrameNames('cloud', {
                frames: [0, 1, 2, 3]
              }),
              frameRate: 10,
              repeat: 0
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
        this.setBgSpeed(100)

        // acelleration test
        // this.bg.forEach((bg) => {
        //     bg.setAccelerationY(1)
        // })
        
        // Player
        this.player = this.physics.add.sprite(this.gameW / 2, this.gameH - 100, 'player')
            .setScale(0.5).setCollideWorldBounds()
        this.player.setBodySize(24, 24, true)
        this.player.weapon = 1
        this.player.health = this.playerMaxHealth
        this.player.maxHealth = this.playerMaxHealth
        this.player.cloudScale = 4
        this.player.isDead = false

        // Player bullets
        this.playerBullets = this.physics.add.group()
        this.playerbulletTimeout = 0

        // Enemies
        this.enemies = this.physics.add.group()
        this.enemyBullets = this.physics.add.group()

        // Power ups
        this.powerUps = this.physics.add.group()

        // death clouds
        this.deathClouds = this.physics.add.group()

        // Overlap checks
        // player bullets hit enemies
        this.physics.add.overlap(this.playerBullets, this.enemies, this.enemyHit, null, this)
        // enemy bullet hit player
        this.physics.add.overlap(this.enemyBullets, this.player, this.playerHitByBullet, null, this)
        // player hit powerup
        this.physics.add.overlap(this.player, this.powerUps, this.getPowerUp, null, this)

        // Stage manager
        this.stageMgr = new StageManager(this, stages)

        // Music
        this.events.emit('playBgm')

        // ======== DEBUG ===========
        // POOL SIZE DEBUG
        // const debugPoolSizeEvent = this.time.addEvent({
        //     delay: 10000,
        //     loop: true,
        //     callbackScope: this,
        //     callback: () => {
        //         console.log(`Pbul: ${this.playerBullets.getLength()} E: ${this.enemies.getLength()} Ebul: ${this.enemyBullets.getLength()} PwrUp: ${this.powerUps.getLength()}`)}
        // })

        // CREATE RANDOM ENEMIES
        // this.time.addEvent({
        //     delay: 1000,
        //     loop: true,
        //     callbackScope: this,
        //     callback: () => {
        //         let rndE = this.randBetween(1, 4)
        //         switch (rndE) {
        //             case 1:
        //                 this.createEnemy()
        //                 break
        //             case 2:
        //                 this.createEnemy2()
        //                 break
        //             case 3:
        //                 this.createEnemy3()
        //             case 4:
        //                 this.createEnemy4()
        //         }
        //     }
        // })

        // CREATE TEST ENEMY DEBUG
        // let testEnemy = this.createEnemy(1, this.gameW/2, this.gameH/2, 1)
        // testEnemy.setVelocityX(0).setVelocityY(0)
        // // // this.testEnemy = testEnemy
        

        // // // // CREATE TEST ENEMY2 DEBUG
        // let testEnemy2 = this.createEnemy2(this.gameW/2 - 100, this.gameH/2 - 100)
        // testEnemy2.setVelocityY(0)
        // // // this.testEnemy = testEnemy2

        // // // // CREATE TEST ENEMY3 DEBUG
        // let testEnemy3 = this.createEnemy3(this.gameW/2 + 100, this.gameH / 2 - 100)
        // testEnemy3.setVelocityY(0)
        // // // CREATE TEST ENEMY4 DEBUG
        // let testEnemy4 = this.createEnemy4(this.gameW/2 + 200, this.gameH / 2 - 100)
        // testEnemy4.setVelocityY(0)

        // console.log(testEnemy)
        // console.log(testEnemy2)
        // console.log(testEnemy3)
        // console.log(testEnemy4)

        // CREATE TEST ATTACKUP
        // let testAttackUp = this.createPowerUp(this.gameW/2 - 200, this.gameH/2 + 150)
        // let testAttackUp2 = this.createPowerUp(this.gameW/2 + 100, this.gameH/2 + 150)
        // let testAttackUp3 = this.createPowerUp(this.gameW/2 - 100, this.gameH/2 + 150)
        // this.createPowerUp(this.gameW/2, this.gameH/2 + 200)
        
        // CREATE TEST CLOUD
        // this.createDeathCloud({x: 100, y: 100})

        // Health display text
        // this.healthTxt = this.add.text(50, this.gameH - 100, 'Health: 50')

        // get key
        this.keyR = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R)
        this.key1 = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ONE)
        this.key2 = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.TWO)
        this.key3 = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.THREE)
        this.key4 = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.FOUR)
        this.key5 = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.FIVE)

        this.debugflash = false

        this.beginText = this.add.text(this.gameW/2, this.gameH/2, 'move: arrow keys   shoot: space', {
            fontFamily: 'Fondamento, Arial',
            fontSize: '40px',
            fill: '#ffffff'
          });
        this.beginText.setOrigin(0.5, 0.5);

        this.time.addEvent({
            delay: 4000,
            loop: false,
            callbackScope: this,
            callback: () => {
                this.beginText.destroy()
            }
        })
    }

    update() {
        this.updateBackground()
        this.updatePlayer()
        this.removeOffScreenBullets()
        this.removeOffScreenEnemies()

        // if (Phaser.Input.Keyboard.JustDown(this.keyR)) this.restart()

        // if (Phaser.Input.Keyboard.JustDown(this.key1)) {
        //     this.player.weapon = 1
        // }
        // if (Phaser.Input.Keyboard.JustDown(this.key2)) {
        //     this.player.weapon = 2
        // }
        // if (Phaser.Input.Keyboard.JustDown(this.key3)) {
        //     this.player.weapon = 3
        // }
        // if (Phaser.Input.Keyboard.JustDown(this.key4)) {
        //     this.player.weapon = 4
        // }
        // if (Phaser.Input.Keyboard.JustDown(this.key5)) {
        //     this.player.weapon = 5
        // }
        // this.healthTxt.text = `Health: ${this.player.health}`

    }

    createEnemy(type, x = null, y = null, speed = null) {
        switch (type) {
            case 1:
                this.createEnemy1(x, y, speed)
                break
            case 2:
                this.createEnemy2(x, y, speed)
                break
            case 3:
                this.createEnemy3(x, y, speed)
                break
            case 4:
                this.createEnemy4(x, y, speed)
        }
    }

    createEnemy1(x = null, y = null, speed = null) {
        let enemy = this.enemies.get(0, 0, 'dragon')
        enemy.setScale(.5)
        enemy.setActive(true).setVisible(true)
        enemy.body.enable = true
        enemy.body.checkCollision.none = false
        enemy.setBodySize(45, 45, true)
        enemy.clearTint()
        enemy.tintC = enemy.tintTopLeft

        const enemyX = x ? x : this.randBetween(0 + enemy.displayWidth / 2 + 1, this.gameW - enemy.displayWidth / 2 - 1)
        const enemyY = y ? y : -25
        enemy.x = enemyX
        enemy.y = enemyY
        enemy.setPosition(enemyX, enemyY)

        speed ? enemy.setVelocityY(speed) : enemy.setVelocityY(this.randBetween(70, 100))

        enemy.shootTimeout = 1000
        enemy.fire = () => {
            let bullet = this.createEnemyBullet(enemy)
            this.seekPlayer(bullet, 200)
            this.events.emit('playFire1')
        }

        enemy.nextShootEvent = this.time.addEvent({
            delay: enemy.shootTimeout,
            loop: true,
            callbackScope: this,
            callback: () => {
                enemy.fire()
            }
        })

        enemy.cloudScale = 2.25
        enemy.health = 2
        return enemy
    }

    createEnemy2(x = null, y = null, speed = null) {
        let enemy = this.createEnemy1(x, y)
        enemy.setScale(.6)
        // enemy.setBodySize(50, 50, true)
        speed ? enemy.setVelocityY(speed) : enemy.setVelocityY(this.randBetween(100, 250))
        enemy.setTint(0xCC6600)
        enemy.tintC = enemy.tintTopLeft

        enemy.fire = () => {
            let bullets = []
            for (let i = 0; i < 5; i++) {
                bullets.push(this.createEnemyBullet(enemy))
            }
            this.seekPlayerShotgun5(enemy, bullets, 200)
            this.events.emit('playFire2')
        }

        enemy.cloudScale = 2.5
        enemy.health = 6
        return enemy
    }

    createEnemy3(x = null, y = null, speed = null) {
        let enemy = this.createEnemy1(x, y)
        enemy.setScale(.7)
        // enemy.setBodySize(50, 50, true)
        speed ? enemy.setVelocityY(speed) : enemy.setVelocityY(this.randBetween(50, 100))
        enemy.setTint(0x4422FF)
        enemy.tintC = enemy.tintTopLeft
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
            this.time.addEvent({
                delay: 50,
                repeat: 0,
                callbackScope: this,
                callback: () => {
                    this.events.emit('playFire3')
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

        enemy.cloudScale = 3
        enemy.health = 8
        return enemy
    }

    createEnemy4(x = null, y = null, speed = null) {
        let enemy = this.createEnemy1(x, y)
        enemy.setScale(.4)
        // enemy.setVelocityX(100, 200)
        speed ? enemy.setVelocityY(speed) : enemy.setVelocityY(100, 150)
        enemy.setTint(0x00FF00)
        enemy.tintC = enemy.tintTopLeft

        enemy.fire = () => {
            let bullets = []
            for (let i = 0; i < 6; i++) {
                bullets.push(this.createEnemyBullet(enemy))
            }
            this.seekPlayerStar(enemy, bullets, 200)
        }

        enemy.cloudScale = 2
        enemy.health = 6
        return enemy
    }

    createEnemyBullet(origin) {
        let bullet = this.activate(this.enemyBullets.get(origin.x, origin.y, 'fireball').setScale(2))
            bullet.setBodySize(4, 4, true)
            bullet.anims.play('fireball')

        return bullet
    }

    enemyHit(bullet, enemy) {
        this.disableSprite(bullet, this.playerBullets)

        enemy.health--
        if (enemy.health === 0 ) {
            this.disableSprite(enemy, this.enemies)
            this.createDeathCloud(enemy)
        }
        else this.damageEffect(enemy)
    }

    disableSprite(sprite, group) {
        if (group) group.killAndHide(sprite)
        // sprite.disableBody() 
        // this.physics.world.remove(sprite)
        sprite.body.checkCollision.none = true
        if (sprite.nextShootEvent) sprite.nextShootEvent.remove()
    }

    updatePlayer() {
        if (this.player.isDead) return

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
            if (this.playerbulletTimeout === 0) this.playerFire()
        }
 
    }

    getPowerUp(player, powerUp) {
        let maxWeapon = 5

        this.disableSprite(powerUp, this.powerUps)
        if (powerUp.powerType = 'attackUp') {
            player.weapon++
            if (player.weapon > maxWeapon) player.weapon = maxWeapon
        }
    }

    playerHitByBullet(player, bullet) {
        if (player.isDead) return

        this.disableSprite(bullet, this.enemyBullets)
        this.damageEffect(player)
        player.health--
        this.events.emit('playerHealth', player)
        if (player.health <= 0) this.playerDie()
    }

    playerDie() {
        this.player.isDead = true
        this.player.setVisible(false)
        this.createDeathCloud(this.player)
        this.events.emit('playerDie')

        this.cameras.main.shake(500);
      
        this.cameras.main.on('camerashakecomplete', function(camera, effect){
            this.cameras.main.fade(500);
        }, this);

        this.cameras.main.on('camerafadeoutcomplete', function(camera, effect){
            this.restart()
        }, this);
    }

    playerFire() {
        switch (this.player.weapon) {
            case 1:
                this.playerFire1()
                break
            case 2:
                this.playerFire2()
                break
            case 3:
                this.playerFire3()
                break
            case 4:
                this.playerFire4()
                break
            case 5:
                this.playerFire5()
        }
    }

    playerFire1() {
        let bullet = this.createPlayerBullet()
        bullet.setVelocityY(-400)
        this.playerbulletTimeout = 20
    }

    playerFire2(speed = null) {
        let bullets = this.createPlayerBullet(2)
        bullets[0].x = this.player.x - 15
        bullets[1].x = this.player.x + 15

        bullets.forEach((bullet) => {
            bullet.setVelocityY(speed || -500)
        })

        this.playerbulletTimeout = 16
    }

    playerFire3(speedX = null, speedY = null) {
        let bullets = this.createPlayerBullet(2)
        bullets[0].x = this.player.x - 20
        bullets[0].setVelocityX(speedX || -150)
        bullets[0].setVelocityY(speedY || -550)

        bullets[1].x = this.player.x + 20
        bullets[1].setVelocityX(-speedX || 150)
        bullets[1].setVelocityY(speedY || -550)

        this.playerFire2(speedY || -550)
        this.playerbulletTimeout = 16
    }

    playerFire4(speed = null) {
        let bullets = this.createPlayerBullet(2)
        bullets[0].x = this.player.x - 20
        bullets[0].setVelocityX(-350)
        bullets[0].setVelocityY(speed || -600)

        bullets[1].x = this.player.x + 20
        bullets[1].setVelocityX(350)
        bullets[1].setVelocityY(speed || -600)

        this.playerFire3(-150, speed || -600)
        this.playerbulletTimeout = 16
    }

    playerFire5() {
        let bullets = this.createPlayerBullet(6)
        bullets.forEach((bullet, index) => {
            let step = -60 + (120 * (1 / (bullets.length - 1) * index))
            bullet.x = this.player.x + step
            bullet.setVelocityY(-800)
        })

        this.playerFire4(-800)
        this.playerbulletTimeout = 10
    }

    createPlayerBullet(amount = 1) {
        let bullets = []
        let bullet
        for (let i = 1; i <= amount; i++) {
            bullet = this.playerBullets.get(this.player.x, this.player.y, 'treasure')
            .setScale(.4).setRotation(3 * Math.PI / 2)
    
            Math.random() > .5 ? bullet.setFlipY(true) : bullet.setFlipY(false)
            bullet.setActive(true).setVisible(true)
            bullet.body.checkCollision.none = false
            this.playerBullets.add(bullet)
            bullets.push(bullet)
        }

        if (amount > 1) return bullets
        else return bullet
    }

    createPowerUp(x = null, y = null, speed = 40) {
        let px, py
        x ? px = x : px = this.gameW/2
        y ? py = y : py = -25

        let powerUp = new PowerUp(this, px, py, 'attackUp')
        this.powerUps.add(powerUp)
        powerUp.body.setVelocityY(speed)
    }

    createDeathCloud(deadThing) {
        let cloud = this.activate(this.deathClouds.get(deadThing.x, deadThing.y, 'cloud'))
        cloud.anims.play('cloud').setScale(deadThing.cloudScale)
        cloud.body.velocity = deadThing.body.velocity.clone()

        cloud.on(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
            this.deathClouds.killAndHide(cloud)
        }, this);

    }

    removeOffScreenBullets() {
        this.playerBullets.getChildren().forEach((bullet) => {
            if (bullet.active && this.isOffScreen(bullet)) {
                this.playerBullets.killAndHide(bullet)
                bullet.disableBody()
            }
        }, this)

        this.enemyBullets.getChildren().forEach((bullet) => {
            if (bullet.active && this.isOffScreen(bullet)) {
                this.enemyBullets.killAndHide(bullet)
                bullet.disableBody()
            }
        }, this)
    }

    removeOffScreenEnemies() {
        this.enemies.getChildren().forEach((enemy) => {
            if (enemy.active && this.isOffScreen(enemy)) {
                this.enemies.killAndHide(enemy)
                enemy.disableBody()
                enemy.nextShootEvent.paused = true
            }
        }, this)
    }

    isOffScreen(obj) {
        if (obj.x < -25|| obj.x > this.gameW + 25 || obj.y < -100 || obj.y > this.gameH + obj.displayHeight) return true
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

    seekPlayerStar(obj, bullets, speed) {
        const targetAngle = Phaser.Math.Angle.Between(obj.x, obj.y, this.player.x, this.player.y)
        let newAngle, mod
        bullets.forEach((bul, index) => {
            mod = 1 / bullets.length * index
            newAngle = targetAngle + (2 * Math.PI * mod)
            bul.setVelocityX(Math.cos(newAngle) * speed)
            bul.setVelocityY(Math.sin(newAngle) * speed)
        })
    }

    damageEffect(obj) {
        this.tweens.addCounter({
            from: 1,
            to: 6,
            duration: 500,
            onUpdate: function (tween)
            {
                const value = Math.floor(tween.getValue());

                value % 2 ? obj.setTint(0xFF0000) : obj.setTint(obj.tintC)
            }
        });        
    }

    restart() {
        this.stopWalk()
        this.events.emit('stopBgm')
        this.scene.restart()
        this.scene.get('uiScene').scene.restart()
    }

    goodbye() {
        let goodbyeText = this.add.text(this.gameW/2, this.gameH/2, 'Goodbye Flecko', {
            fontFamily: 'Fondamento, Arial',
            fontSize: '40px',
            fill: '#ffffff'
          });
        goodbyeText.setOrigin(0.5, 0.5);

        this.bg.forEach((bg) => {bg.setAccelerationY(1)})
    }
}

export default GameScene
