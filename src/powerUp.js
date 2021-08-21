import Phaser from 'phaser'

export default class powerUp extends Phaser.GameObjects.Container {
    constructor(scene, x, y, powerType) {
        super(scene, x, y)
        this.setSize(52, 48)
        this.scene.physics.world.enable(this);
        this.scene.add.existing(this);

        this.powerType = powerType

        switch (powerType) {
            case 'attackUp' :
            default:
                this.attackUp()
        }
    }

    attackUp() {
        let scale = 0.6
        let img

        img = this.scene.add.image(5, -5, 'treasure')
        img.setScale(scale)
        this.add(img)
        img = this.scene.add.image(-5, 5, 'treasure')
        img.setScale(scale)
        this.add(img)
    }
}
