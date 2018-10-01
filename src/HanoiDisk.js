import THREE from 'three';
import utility from './utility';

class HanoiDisk {
    constructor(radius = 2, tube = 0.5, color = null) {
        this.radius = radius;
        this.tube = tube;
        this.color = color ? color : 0xf8df35;

        this.object = null;

        this.keys = [];
        this.keyIndex = 0;
        this.timer = null;
    }

    init() {
        const geometry = new THREE.TorusGeometry(this.radius, this.tube, 24, 64, utility.TWO_PI);
        const material = new THREE.MeshPhongMaterial({ color: this.color, shininess: 175 });

        this.object = new THREE.Mesh(geometry, material);
        this.object.castShadow = true;
        this.object.rotation.x = utility.degToRad(90);
    }

    setPosition(x, y, z) {   
        this.object.position.x = x;
        this.object.position.y = y;
        this.object.position.z = z;
    }

    setTarget(keys) {
        this.keys = keys;
        this.keyIndex = 0;
    }

    update(delta) {
        if (this.keys[this.keyIndex]) {
            const { x, y, z, t } = this.keys[this.keyIndex];
            const dt = 0.3;
            this.object.position.x = utility.lerp(this.object.position.x, x, dt);
            this.object.position.y = utility.lerp(this.object.position.y, y, dt);
            this.object.position.z = utility.lerp(this.object.position.z, z, dt);

            if (this.timer ===  null) {
                this.timer = delta + t;
            }

            if (delta >= this.timer) {
                this.timer = null;
                this.keyIndex++;
            }
        }
    }

    getPosition() {
        return this.object.position;
    }
}

export default HanoiDisk;
