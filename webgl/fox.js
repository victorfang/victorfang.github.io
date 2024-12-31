import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

let scene, camera, renderer, fox, controls;

// Initialize the scene
function init() {
    // Scene setup
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0f0f0);

    // Camera setup
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 5;
    camera.position.y = 2;

    // Renderer setup
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    document.body.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 5, 5);
    directionalLight.castShadow = true;
    scene.add(directionalLight);

    // Controls
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 3;
    controls.maxDistance = 10;

    // Load the fox model
    const loader = new GLTFLoader();
    loader.load(
        'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/Fox/glTF/Fox.gltf',
        function (gltf) {
            fox = gltf.scene;
            fox.scale.set(0.05, 0.05, 0.05);
            scene.add(fox);

            // Play the idle animation
            const mixer = new THREE.AnimationMixer(fox);
            const clips = gltf.animations;
            const clip = THREE.AnimationClip.findByName(clips, 'Survey');
            const action = mixer.clipAction(clip);
            action.play();

            // Hide loading message
            document.querySelector('.loading').style.display = 'none';

            // Animation loop
            function animate() {
                requestAnimationFrame(animate);
                mixer.update(0.016);
                controls.update();
                renderer.render(scene, camera);

                // Make the fox look at the mouse
                if (mouseX && mouseY) {
                    const vector = new THREE.Vector3(mouseX, mouseY, 0);
                    vector.unproject(camera);
                    const dir = vector.sub(camera.position).normalize();
                    const distance = -camera.position.z / dir.z;
                    const pos = camera.position.clone().add(dir.multiplyScalar(distance));
                    fox.lookAt(pos);
                }
            }
            animate();
        },
        // Loading progress
        function (xhr) {
            const percent = (xhr.loaded / xhr.total * 100);
            const loadingText = document.querySelector('.loading');
            if (loadingText) {
                loadingText.textContent = `Loading 3D Fox... ${Math.round(percent)}%`;
            }
        },
        // Error handling
        function (error) {
            console.error('An error occurred loading the model:', error);
            const loadingText = document.querySelector('.loading');
            if (loadingText) {
                loadingText.textContent = 'Error loading 3D model. Please try again later.';
                loadingText.style.color = 'red';
            }
        }
    );
}

// Mouse tracking
let mouseX = 0;
let mouseY = 0;

function onMouseMove(event) {
    mouseX = (event.clientX / window.innerWidth) * 2 - 1;
    mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
}

// Window resize handler
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// Event listeners
window.addEventListener('mousemove', onMouseMove);
window.addEventListener('resize', onWindowResize);

// Initialize the scene
init(); 