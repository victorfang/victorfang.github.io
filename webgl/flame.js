import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

let scene, camera, renderer, controls;
let flameParticles, smokeParticles;
const flameCount = 3000;
const smokeCount = 1000;

function init() {
    // Scene setup
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);

    // Camera setup
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 5;
    camera.position.y = 2;

    // Renderer setup
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // Controls
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 3;
    controls.maxDistance = 10;

    // Create particles
    createFlame();
    createSmoke();

    // Animation loop
    animate();
}

function createFlame() {
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(flameCount * 3);
    const colors = new Float32Array(flameCount * 3);
    const sizes = new Float32Array(flameCount);
    const lifetimes = new Float32Array(flameCount);

    const color = new THREE.Color();
    
    for (let i = 0; i < flameCount; i++) {
        // Position
        const angle = Math.random() * Math.PI * 2;
        const radius = Math.random() * 0.3;
        const height = Math.random() * 2;
        
        positions[i * 3] = Math.cos(angle) * radius;
        positions[i * 3 + 1] = height;
        positions[i * 3 + 2] = Math.sin(angle) * radius;

        // Color - more orange/red variation
        const heightFactor = height / 2;
        const hue = 0.05 + heightFactor * 0.05 - Math.random() * 0.02;
        color.setHSL(hue, 1.0, 0.5 + heightFactor * 0.5);
        
        colors[i * 3] = color.r;
        colors[i * 3 + 1] = color.g;
        colors[i * 3 + 2] = color.b;

        // Size - varied particle sizes
        sizes[i] = (Math.random() * 0.1 + 0.05) * (1 - heightFactor * 0.5);
        
        // Lifetime for animation
        lifetimes[i] = Math.random();
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    geometry.setAttribute('lifetime', new THREE.BufferAttribute(lifetimes, 1));

    const material = new THREE.PointsMaterial({
        size: 0.1,
        vertexColors: true,
        blending: THREE.AdditiveBlending,
        transparent: true,
        sizeAttenuation: true,
        opacity: 0.8
    });

    flameParticles = new THREE.Points(geometry, material);
    scene.add(flameParticles);
}

function createSmoke() {
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(smokeCount * 3);
    const colors = new Float32Array(smokeCount * 3);
    const sizes = new Float32Array(smokeCount);
    const lifetimes = new Float32Array(smokeCount);

    const color = new THREE.Color();
    
    for (let i = 0; i < smokeCount; i++) {
        // Position
        const angle = Math.random() * Math.PI * 2;
        const radius = Math.random() * 0.5;
        const height = Math.random() * 3 + 1.5;
        
        positions[i * 3] = Math.cos(angle) * radius;
        positions[i * 3 + 1] = height;
        positions[i * 3 + 2] = Math.sin(angle) * radius;

        // Color - grey smoke
        const brightness = 0.2 + Math.random() * 0.1;
        color.setRGB(brightness, brightness, brightness);
        
        colors[i * 3] = color.r;
        colors[i * 3 + 1] = color.g;
        colors[i * 3 + 2] = color.b;

        // Size
        sizes[i] = Math.random() * 0.2 + 0.1;
        
        // Lifetime for animation
        lifetimes[i] = Math.random();
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    geometry.setAttribute('lifetime', new THREE.BufferAttribute(lifetimes, 1));

    const material = new THREE.PointsMaterial({
        size: 0.15,
        vertexColors: true,
        blending: THREE.AdditiveBlending,
        transparent: true,
        opacity: 0.2,
        sizeAttenuation: true
    });

    smokeParticles = new THREE.Points(geometry, material);
    scene.add(smokeParticles);
}

function updateParticles() {
    // Update flame
    const flamePos = flameParticles.geometry.attributes.position.array;
    const flameColors = flameParticles.geometry.attributes.color.array;
    const flameSizes = flameParticles.geometry.attributes.size.array;
    const flameLifetimes = flameParticles.geometry.attributes.lifetime.array;
    const flameColor = new THREE.Color();

    // Update smoke
    const smokePos = smokeParticles.geometry.attributes.position.array;
    const smokeColors = smokeParticles.geometry.attributes.color.array;
    const smokeSizes = smokeParticles.geometry.attributes.size.array;
    const smokeLifetimes = smokeParticles.geometry.attributes.lifetime.array;
    const smokeColor = new THREE.Color();

    // Update flame particles
    for (let i = 0; i < flameCount; i++) {
        // Update lifetime
        flameLifetimes[i] += 0.016;
        if (flameLifetimes[i] > 1) {
            flameLifetimes[i] = 0;
            const angle = Math.random() * Math.PI * 2;
            const radius = Math.random() * 0.3;
            flamePos[i * 3] = Math.cos(angle) * radius;
            flamePos[i * 3 + 1] = 0;
            flamePos[i * 3 + 2] = Math.sin(angle) * radius;
        }

        // Update position with turbulence
        flamePos[i * 3] += (Math.random() - 0.5) * 0.01;
        flamePos[i * 3 + 1] += 0.05 * (1 - flameLifetimes[i] * 0.5);
        flamePos[i * 3 + 2] += (Math.random() - 0.5) * 0.01;

        // Update color
        const heightFactor = flamePos[i * 3 + 1] / 2;
        const hue = 0.05 + heightFactor * 0.05 - Math.random() * 0.02;
        flameColor.setHSL(hue, 1.0, 0.5 + heightFactor * 0.5);
        
        flameColors[i * 3] = flameColor.r;
        flameColors[i * 3 + 1] = flameColor.g;
        flameColors[i * 3 + 2] = flameColor.b;

        // Update size
        flameSizes[i] = (Math.random() * 0.1 + 0.05) * (1 - heightFactor * 0.5);
    }

    // Update smoke particles
    for (let i = 0; i < smokeCount; i++) {
        // Update lifetime
        smokeLifetimes[i] += 0.005;
        if (smokeLifetimes[i] > 1) {
            smokeLifetimes[i] = 0;
            const angle = Math.random() * Math.PI * 2;
            const radius = Math.random() * 0.3;
            smokePos[i * 3] = Math.cos(angle) * radius;
            smokePos[i * 3 + 1] = 1.5;
            smokePos[i * 3 + 2] = Math.sin(angle) * radius;
        }

        // Update position with swirling effect
        const swirl = Math.sin(smokeLifetimes[i] * Math.PI * 2) * 0.02;
        smokePos[i * 3] += swirl;
        smokePos[i * 3 + 1] += 0.02;
        smokePos[i * 3 + 2] += (Math.random() - 0.5) * 0.01;

        // Update color (fade out)
        const fadeOut = 1 - smokeLifetimes[i];
        const brightness = (0.2 + Math.random() * 0.1) * fadeOut;
        smokeColor.setRGB(brightness, brightness, brightness);
        
        smokeColors[i * 3] = smokeColor.r;
        smokeColors[i * 3 + 1] = smokeColor.g;
        smokeColors[i * 3 + 2] = smokeColor.b;

        // Update size
        smokeSizes[i] = (Math.random() * 0.2 + 0.1) * (1 + smokeLifetimes[i]);
    }

    // Update geometries
    flameParticles.geometry.attributes.position.needsUpdate = true;
    flameParticles.geometry.attributes.color.needsUpdate = true;
    flameParticles.geometry.attributes.size.needsUpdate = true;
    
    smokeParticles.geometry.attributes.position.needsUpdate = true;
    smokeParticles.geometry.attributes.color.needsUpdate = true;
    smokeParticles.geometry.attributes.size.needsUpdate = true;
}

function animate() {
    requestAnimationFrame(animate);
    
    updateParticles();
    controls.update();
    
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