import THREE from 'three';

import './OrbitControls';

import HanoiDisk from './HanoiDisk';
import HanoiRod from './HanoiRod';

/**
 * Hanoi scene
 */
class Hanoi {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;

        // number of disks
        this.diskNb = 3;

        // object that represents the hanoi towers
        this.disks = {
            'A': [],
            'B': [],
            'C': []
        };

        // list of precalculated animations
        this.animations = [];

        // timer reference for timing the animations
        this.timer = null;

        // state of the animation (play/pause)
        this.running = false;
    }
    
    /**
     * Main initialization of the scene
     */
    init() {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);

        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio || 1);
        this.renderer.shadowMap.enabled = true;

        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);

        document.body.appendChild(this.renderer.domElement);

        const $uiReloadBtn = document.querySelector('#uiReloadBtn');
        const $uiToggleBtn = document.querySelector('#uiToggleBtn');
        
        // main events
        $uiReloadBtn.addEventListener('click', (e) => {
            this.stop();
            this.reload();
        });

        $uiToggleBtn.addEventListener('click', (e) => {
            if (this.running) {
                this.stop();
            } else {
                this.start();
            }
        });

        const $uiDiskNb = document.querySelector('#uiDiskNb');
        
        $uiDiskNb.addEventListener('change', (e) => {
            e.preventDefault();

            let n = parseInt($uiDiskNb.value, 10);

            if (n < 3) {
                n = 3;
            }
            if (n > 25) {
                n = 25;
            }

            $uiDiskNb.value = n;

            if (n !== this.diskNb) {
                this.stop();
                this.load(n);
            }
        });

        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
        
            this.renderer.setSize(window.innerWidth, window.innerHeight);
            this.renderer.setPixelRatio(window.devicePixelRatio || 1);
        });
    }

    /**
     * Loads a scene
     * @param {number} n Number of disks
     */
    load(n = 3) {
        this.diskNb = n;
        this.timer = null;

        this.animations = this.simulate(n);

        this.clean();
        this.prepScene(n);
    }

    /**
     * Reloads the scene with the current parameters
     */
    reload() {
        this.load(this.diskNb);
    }

    /**
     * Simulate the towers of hanoi algo
     * @param {number} diskNb 
     * @return {Array} List of disk movements
     */
    simulate(diskNb) {
        const instructions = [];

        // hanoi algo
        const hanoiAlgo = (n, source, target, auxiliary) => {
            if (n > 0) {
                hanoiAlgo(n - 1, source, auxiliary, target);
                instructions.push({ source, target });
                hanoiAlgo(n - 1, auxiliary, target, source);
            }
        };

        hanoiAlgo(diskNb, 'A', 'C', 'B');
        
        return instructions;
    }

    render(delta) {
        requestAnimationFrame(this.render.bind(this));

        this.controls.update();

        if (this.running) {
            // unstack animations one by one each 1.25s
            if(this.animations.length > 0 && (this.timer === null || delta >= this.timer)) {
                const { source, target } = this.animations.shift();      

                this.animate(source, target);
                this.timer = delta + 1250;
            }
            
            // update disk positions
            this.disks.A.forEach((disk) => disk.update(delta));
            this.disks.B.forEach((disk) => disk.update(delta));
            this.disks.C.forEach((disk) => disk.update(delta));
        }

        this.renderer.render(this.scene, this.camera);
    }

    /**
     * Animate a disk from a source position to a target position
     * @param {string} source Source stack name
     * @param {string} target Target stack name
     */
    animate(source, target) {
        const targetOffset = target.charCodeAt(0) - 65;

        // calculate a slot coordinates on the scene (a torus position on a rode)
        const { x, y, z } = this.getSlotPosition(this.disks[target].length, targetOffset);

        const disk = this.disks[source].pop();
        const pos = disk.getPosition();
        const rodHeight = this.getRodHeight();

        // set disk animation keys
        if (disk) {
            disk.setTarget([
                { ox: pos.x, oy: pos.y, x: pos.x, y: rodHeight + 3, z: pos.z, t: 250 },
                { ox: pos.x, oy: pos.y, x: x, y: rodHeight + 3, z: z, t: 500 },
                { ox: pos.x, oy: pos.y, x: x, y: y, z: z, t: 250 },
            ]);
            
            this.disks[target].push(disk);
        }
    }

    /**
     * Create all scene elements (base, rodes, disks)
     * @param {number} diskNb Number of disks
     */
    prepScene(diskNb) {
        const gap = this.getGapSize();
        const rodHeight = this.getRodHeight();
        const diskSize = this.getDiskSize();

        this.disks = {
            'A': [],
            'B': [],
            'C': [],
        };

        // base
        const geometry = new THREE.BoxGeometry(gap * 3 + 4, 2, gap + 4);
        const material = new THREE.MeshPhongMaterial({ color: 0x848484, shininess: 25 });
        const box = new THREE.Mesh(geometry, material);
        box.position.set(0, -1, 0);
        box.receiveShadow = true;
        this.scene.add(box);

        // lights
        const ambLight = new THREE.AmbientLight(0x808080);
        this.scene.add(ambLight);
        
        const light = new THREE.PointLight(0xffffff, 0.4);
        light.position.set(100, 0, 150);
        light.castShadow = true;
        this.scene.add(light);

        // rods
        for(let i = 0; i < 3; i++) {
            const rod = new HanoiRod(0.25, rodHeight);
            rod.init();
            rod.setPosition(-gap + gap * i, rodHeight / 2, 0);

            this.scene.add(rod.object);
        }

        // disks
        for(let i = 0; i < diskNb; i++) {
            const diskRadius = diskSize + (diskNb - 1 - i) * diskSize;
            const diskTube = 1;

            const disk = new HanoiDisk(diskRadius, diskTube, Hanoi.COLORS[i % Hanoi.COLORS.length]);
            const pos = this.getSlotPosition(i, 0);

            disk.init();
            disk.setPosition(pos.x, pos.y, pos.z);

            this.scene.add(disk.object);
            this.disks.A.push(disk);
        }

        // camera position
        this.camera.position.set(0, rodHeight, gap * 2 + 10);
        this.controls.update();
    }

    start() {
        this.running = true;

        const $uiToggleBtn = document.querySelector('#uiToggleBtn');
        $uiToggleBtn.textContent = 'Stop';
        $uiToggleBtn.classList.add('btn_stop');
        $uiToggleBtn.classList.remove('btn_start');
    }

    stop() {
        this.running = false;
        
        const $uiToggleBtn = document.querySelector('#uiToggleBtn');
        $uiToggleBtn.textContent = 'Start';
        $uiToggleBtn.classList.add('btn_start');
        $uiToggleBtn.classList.remove('btn_stop');
    }

    clean() {
        while(this.scene.children.length > 0){ 
            this.scene.remove(this.scene.children[0]); 
        }
    }

    
    getGapSize() {
        return 10 * this.diskNb / 3;
    }

    getRodHeight() {
        return 2 * this.diskNb - (this.diskNb - 1) * 0.75;
    }

    getSlotPosition(row, col) {
        const gap = this.getGapSize();
        return {
            x: -gap + col * gap,
            y: row * 2 + 1 - row * 0.75,
            z: 0,
        };
    }

    getDiskSize() {
        const gap = this.getGapSize();
        return ((gap - 3) / 2) / this.diskNb;
    }
}


Hanoi.COLORS = [0x59b5d9, 0xff5966, 0xffde59, 0x77bf56, 0xcef19e];

export default Hanoi;
