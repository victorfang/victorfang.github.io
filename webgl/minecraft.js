import * as THREE from 'three';
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';

let scene, camera, renderer, controls;
let terrain = new THREE.Group();
let blocks = new Map(); // Store block positions
let moveForward = false;
let moveBackward = false;
let moveLeft = false;
let moveRight = false;
let canJump = false;

const velocity = new THREE.Vector3();
const direction = new THREE.Vector3();
let prevTime = performance.now();

// Adjust these constants at the top of the file
const GRAVITY = 30.0;
const JUMP_FORCE = 15.0;  // Increased jump force
const MOVEMENT_SPEED = 50.0;  // Increased from 15.0 to 50.0
const DAMPING = 4.0;  // Slightly reduced damping for smoother acceleration

// Block textures and materials
const materials = {
    grass: new THREE.MeshStandardMaterial({ 
        color: 0x55aa55,
        roughness: 0.8
    }),
    dirt: new THREE.MeshStandardMaterial({ 
        color: 0x805432,
        roughness: 0.9
    }),
    wood: new THREE.MeshStandardMaterial({ 
        color: 0x6e4a1f,
        roughness: 0.7
    }),
    leaves: new THREE.MeshStandardMaterial({ 
        color: 0x3f5e31,
        transparent: true,
        opacity: 0.8,
        roughness: 0.8
    }),
    glass: new THREE.MeshStandardMaterial({ 
        color: 0x88ccff,
        transparent: true,
        opacity: 0.3,
        roughness: 0.0,
        metalness: 1.0
    }),
    brick: new THREE.MeshStandardMaterial({ 
        color: 0xaa4444,
        roughness: 0.7
    }),
    snow: new THREE.MeshStandardMaterial({ 
        color: 0xffffff,
        roughness: 0.4
    }),
    water: new THREE.MeshStandardMaterial({ 
        color: 0x3333ff,
        transparent: true,
        opacity: 0.6,
        roughness: 0.2,
        metalness: 0.8
    }),
    stone: new THREE.MeshStandardMaterial({ 
        color: 0x666666,
        roughness: 0.8
    }),
    blueText: new THREE.MeshStandardMaterial({ 
        color: 0x0088ff,
        roughness: 0.7,
        metalness: 0.3
    })
};

// Letter patterns for "VICTOR FANG"
const letters = {
    'V': [
        "# #",
        "# #",
        "# #",
        " # ",
        " # "
    ],
    'I': [
        "###",
        " # ",
        " # ",
        " # ",
        "###"
    ],
    'C': [
        "###",
        "#  ",
        "#  ",
        "#  ",
        "###"
    ],
    'T': [
        "###",
        " # ",
        " # ",
        " # ",
        " # "
    ],
    'O': [
        "###",
        "# #",
        "# #",
        "# #",
        "###"
    ],
    'R': [
        "###",
        "# #",
        "###",
        "# #",
        "# #"
    ],
    'F': [
        "###",
        "#  ",
        "###",
        "#  ",
        "#  "
    ],
    'A': [
        "###",
        "# #",
        "###",
        "# #",
        "# #"
    ],
    'N': [
        "# #",
        "## #",
        "# ##",
        "# #",
        "# #"
    ],
    'G': [
        "###",
        "#  ",
        "# #",
        "# #",
        "###"
    ],
    'L': [
        "#  ",
        "#  ",
        "#  ",
        "#  ",
        "###"
    ],
    'B': [
        "###",
        "# #",
        "###",
        "# #",
        "###"
    ]
};

function init() {
    // Scene setup
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87CEEB); // Sky blue

    // Camera setup
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    // Move camera to a better viewing position
    camera.position.set(-20, 15, 30); // Changed position
    camera.lookAt(0, 0, 0); // Make camera look at the center

    // Renderer setup
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    document.body.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xffffff, 1.2); // Increased intensity
    sunLight.position.set(-50, 100, 50);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;  // Increased shadow quality
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 500;
    scene.add(sunLight);

    // Controls
    controls = new PointerLockControls(camera, document.body);

    // Click to start
    const startButton = document.createElement('div');
    startButton.style.position = 'absolute';
    startButton.style.top = '50%';
    startButton.style.left = '50%';
    startButton.style.transform = 'translate(-50%, -50%)';
    startButton.style.padding = '10px 20px';
    startButton.style.background = 'rgba(255, 255, 255, 0.8)';
    startButton.style.borderRadius = '5px';
    startButton.style.cursor = 'pointer';
    startButton.textContent = 'Click to Play';
    document.body.appendChild(startButton);

    // Generate terrain first
    generateTerrain();

    // Set initial camera position after terrain is generated
    const spawnPoint = new THREE.Vector3(-20, 10, 30);
    camera.position.copy(spawnPoint);
    controls.getObject().position.copy(spawnPoint);

    startButton.addEventListener('click', function () {
        controls.lock();
        startButton.style.display = 'none';
    });

    controls.addEventListener('lock', function () {
        startButton.style.display = 'none';
    });

    controls.addEventListener('unlock', function () {
        startButton.style.display = 'block';
    });

    // Movement controls
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('keyup', onKeyUp);

    // Animation loop
    animate();
}

function onKeyDown(event) {
    switch (event.code) {
        case 'ArrowUp':
        case 'KeyW':
            moveForward = true;
            break;
        case 'ArrowDown':
        case 'KeyS':
            moveBackward = true;
            break;
        case 'ArrowLeft':
        case 'KeyA':
            moveLeft = true;
            break;
        case 'ArrowRight':
        case 'KeyD':
            moveRight = true;
            break;
        case 'Space':
            if (canJump) {
                velocity.y = JUMP_FORCE;
                canJump = false;
            }
            break;
    }
}

function onKeyUp(event) {
    switch (event.code) {
        case 'ArrowUp':
        case 'KeyW':
            moveForward = false;
            break;
        case 'ArrowDown':
        case 'KeyS':
            moveBackward = false;
            break;
        case 'ArrowLeft':
        case 'KeyA':
            moveLeft = false;
            break;
        case 'ArrowRight':
        case 'KeyD':
            moveRight = false;
            break;
    }
}

function updateMovement(delta) {
    if (controls.isLocked) {
        // Apply damping to smooth out movement
        velocity.x -= velocity.x * DAMPING * delta;
        velocity.z -= velocity.z * DAMPING * delta;
        velocity.y -= GRAVITY * delta; // Smoother gravity

        direction.z = Number(moveForward) - Number(moveBackward);
        direction.x = Number(moveRight) - Number(moveLeft);
        direction.normalize();

        if (moveForward || moveBackward) {
            velocity.z -= direction.z * MOVEMENT_SPEED * delta;
        }
        if (moveLeft || moveRight) {
            velocity.x -= direction.x * MOVEMENT_SPEED * delta;
        }

        // Ground collision with smoother stop
        if (camera.position.y < 2) {
            velocity.y = Math.max(0, velocity.y);
            camera.position.y = 2;
            canJump = true;
        }

        // Update jump force
        if (canJump && velocity.y > 0) {
            velocity.y = JUMP_FORCE;
        }

        // Smooth movement application
        controls.moveRight(-velocity.x * delta);
        controls.moveForward(-velocity.z * delta);
        camera.position.y += velocity.y * delta;
    }
}

function generateTerrain() {
    const size = 30; // Increased terrain size
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const baseHeight = 0; // Base terrain height

    // Clear any existing terrain
    while(terrain.children.length > 0){ 
        terrain.remove(terrain.children[0]); 
    }
    blocks.clear();

    // Generate flat base terrain
    for (let x = -size; x < size; x++) {
        for (let z = -size; z < size; z++) {
            // Create ground blocks
            for (let y = -2; y <= baseHeight; y++) {
                let material = materials.dirt;
                if (y === baseHeight) material = materials.grass;
                if (y < -1) material = materials.stone;

                const block = new THREE.Mesh(geometry, material);
                block.position.set(x, y, z);
                block.castShadow = true;
                block.receiveShadow = true;
                terrain.add(block);
                blocks.set(`${x},${y},${z}`, block);
            }
        }
    }

    // Add terrain to scene if it hasn't been added yet
    if (!scene.children.includes(terrain)) {
        scene.add(terrain);
    }

    // Write "VICTOR FANG"
    let startX = -25;
    let startY = 1;
    let startZ = 0;
    const spacing = 5;

    ["V", "I", "C", "T", "O", "R"].forEach(letter => {
        createLetter(letter, startX, startY, startZ, materials.brick);
        startX += spacing;
    });

    startX += 2;

    ["F", "A", "N", "G"].forEach(letter => {
        createLetter(letter, startX, startY, startZ, materials.brick);
        startX += spacing;
    });

    // Write "ABIGAIL FANG" below
    startX = -25;
    startY = 1;
    startZ = 8; // Move it forward

    ["A", "B", "I", "G", "A", "I", "L"].forEach(letter => {
        createLetter(letter, startX, startY, startZ, materials.blueText);
        startX += spacing;
    });

    startX += 2;

    ["F", "A", "N", "G"].forEach(letter => {
        createLetter(letter, startX, startY, startZ, materials.blueText);
        startX += spacing;
    });

    // Add decorative features
    addDecorations();
}

function createLetter(letter, startX, startY, startZ, material) {
    const letterPattern = letters[letter];
    const geometry = new THREE.BoxGeometry(1, 1, 1);

    for (let y = 0; y < letterPattern.length; y++) {
        for (let x = 0; x < letterPattern[y].length; x++) {
            if (letterPattern[y][x] === '#') {
                const block = new THREE.Mesh(geometry, material);
                block.position.set(startX + x, startY + (4 - y), startZ);
                block.castShadow = true;
                block.receiveShadow = true;
                terrain.add(block);
                blocks.set(`${startX + x},${startY + (4 - y)},${startZ}`, block);
            }
        }
    }
}

function addDecorations() {
    // Add trees around the text but keep them far
    for (let i = 0; i < 15; i++) {
        const x = Math.random() * 50 - 25;
        // Place trees either far in front or far behind the text
        const z = Math.random() < 0.5 ? 
            Math.random() * 10 - 20 :  // Behind the text (-20 to -10)
            Math.random() * 10 + 15;   // In front of text (15 to 25)
        createTree(x, 1, z);
    }

    // Add water features with similar spacing
    for (let i = 0; i < 5; i++) {
        const x = Math.random() * 50 - 25;
        const z = Math.random() < 0.5 ?
            Math.random() * 8 - 18 :   // Behind the text
            Math.random() * 8 + 13;    // In front of text
        createWaterPool(x, 0, z);
    }

    // Add glass decorations
    for (let i = 0; i < 3; i++) {
        const x = Math.random() * 50 - 25;
        const z = Math.random() < 0.5 ?
            Math.random() * 5 - 15 :   // Behind the text
            Math.random() * 5 + 12;    // In front of text
        createGlassStructure(x, 1, z);
    }

    // Add some snow patches
    for (let i = 0; i < 4; i++) {
        const x = Math.random() * 50 - 25;
        const z = Math.random() < 0.5 ?
            Math.random() * 8 - 18 :   // Behind the text
            Math.random() * 8 + 13;    // In front of text
        createSnowPatch(x, 1, z);
    }
}

function createTree(x, y, z) {
    const geometry = new THREE.BoxGeometry(1, 1, 1);

    // Trunk
    for (let i = 0; i < 4; i++) {
        const trunk = new THREE.Mesh(geometry, materials.wood);
        trunk.position.set(x, y + i, z);
        terrain.add(trunk);
        blocks.set(`${x},${y+i},${z}`, trunk);
    }

    // Leaves
    for (let dx = -2; dx <= 2; dx++) {
        for (let dz = -2; dz <= 2; dz++) {
            for (let dy = 4; dy <= 6; dy++) {
                if (Math.random() < 0.7) {
                    const leaf = new THREE.Mesh(geometry, materials.leaves);
                    leaf.position.set(x + dx, y + dy, z + dz);
                    terrain.add(leaf);
                    blocks.set(`${x+dx},${y+dy},${z+dz}`, leaf);
                }
            }
        }
    }
}

function createWaterPool(x, y, z) {
    const geometry = new THREE.BoxGeometry(1, 0.5, 1);
    const size = 2 + Math.floor(Math.random() * 3);

    for (let dx = -size; dx <= size; dx++) {
        for (let dz = -size; dz <= size; dz++) {
            const water = new THREE.Mesh(geometry, materials.water);
            water.position.set(x + dx, y - 0.25, z + dz);
            terrain.add(water);
            blocks.set(`${x+dx},${y},${z+dz}`, water);
        }
    }
}

function createSnowPatch(x, y, z) {
    const geometry = new THREE.BoxGeometry(1, 0.2, 1);
    const size = 1 + Math.floor(Math.random() * 3);

    for (let dx = -size; dx <= size; dx++) {
        for (let dz = -size; dz <= size; dz++) {
            if (Math.random() < 0.7) {
                const snow = new THREE.Mesh(geometry, materials.snow);
                snow.position.set(x + dx, y - 0.4, z + dz);
                terrain.add(snow);
                blocks.set(`${x+dx},${y},${z+dz}`, snow);
            }
        }
    }
}

function createGlassStructure(x, y, z) {
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const height = 2 + Math.floor(Math.random() * 3);

    for (let dy = 0; dy < height; dy++) {
        const glass = new THREE.Mesh(geometry, materials.glass);
        glass.position.set(x, y + dy, z);
        terrain.add(glass);
        blocks.set(`${x},${y+dy},${z}`, glass);
    }
}

function animate() {
    requestAnimationFrame(animate);

    const time = performance.now();
    const delta = (time - prevTime) / 1000;
    prevTime = time;

    updateMovement(delta);
    renderer.render(scene, camera);
}

// Window resize handler
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// Event listeners
window.addEventListener('resize', onWindowResize);

// Initialize the scene
init(); 