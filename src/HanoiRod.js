import THREE from 'three';

class HanoiRod {
    constructor(radius = 0.25, height = 10, color = null) {
        this.radius = radius;
        this.height = height;
        this.color = color ? color : 0xd2d1d6;

        this.object = null;
    }

    init() {
        const geometry = new THREE.CylinderGeometry(this.radius, this.radius, this.height, 16);
        const material = new THREE.MeshPhongMaterial({ color: this.color, shininess: 25 });

        this.object = new THREE.Mesh(geometry, material);
        this.object.castShadow = true;
    }

    setPosition(x, y, z) {   
        this.object.position.x = x;
        this.object.position.y = y;
        this.object.position.z = z;
    }

    getPosition() {
        return this.object.position;
    }
}

export default HanoiRod;
