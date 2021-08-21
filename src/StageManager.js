const MARGIN = 10
const SIZE = [35, 35, 42, 49, 28, 52]


export default class StageManager {
    constructor(scene, stages) {
        this.scene = scene
        this.stages = stages
        this.index = 0

        this.next()
    }

    next() {
        if (this.index >= this.stages.length) {
            // console.log('restarting')
            // this.delay(10000)
            // this.index = 0
            this.index-= 4
        }

        let cur = this.stages[this.index]

        switch (typeof(cur)) {
            case 'number':
                this.delay(cur)
                break
            case 'string':
                this.wave(cur)
                break
            default:
                console.log('skipped unknown')
        }
    }

    wave(cur) {
        if (this.stages[this.index] === 'bye') {
            this.scene.goodbye()
            this.index+= 1
            this.next()
        }
        // console.log('creating wave')
        const waveXOrigin = this.scene.gameW * this.stages[this.index + 1]
        const speed = this.stages[this.index + 2]
        let waveX
        const wave = this.parse(cur)
        let mid = Math.floor(wave.length / 2)
        
        this.createThing(wave[mid], waveXOrigin, speed)
        
        // left side
        waveX = waveXOrigin - SIZE[wave[mid]] - MARGIN
        for (let i = mid - 1; i >= 0; i--) {
            this.createThing(wave[i], waveX, speed)
            waveX = waveX - SIZE[wave[i]] - MARGIN
        }

        // right side
        waveX = waveXOrigin + SIZE[wave[mid]] + MARGIN
        for (let i = mid + 1; i <= wave.length; i++) {
            this.createThing(wave[i], waveX, speed)
            waveX = waveX + SIZE[wave[i]] + MARGIN
        }

        this.index += 2
        this.next()
    }

    createThing(type, x, speed) {
        if (type > 0)  {
            if (type < 5) this.scene.createEnemy(type, x, null, speed)
            else this.scene.createPowerUp(x, null, speed)
        }
    }

    parse(x) {
        let wave = x.split('')

        for (let i = 0; i < wave.length; i++) {
            if (wave[i] === ' ') wave[i] = 0
            wave[i] = parseInt(wave[i])
        }

        return wave
    }

    delay(cur) {
        // console.log(`delay: ${cur}`)
        this.scene.time.addEvent({
            delay: cur,
            callbackScope: this,
            callback: () => this.next()
        })
        this.index++
    }


}

