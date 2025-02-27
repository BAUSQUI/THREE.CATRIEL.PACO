import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

// Configuración básica de la escena
const scene = new THREE.Scene();
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Cámaras individuales para cada modelo
const cameraPaco = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const cameraCato = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
cameraPaco.position.set(0, 0, 10);
cameraCato.position.set(0, 0, 10);

// Controles individuales para cada cámara
const controlsPaco = new OrbitControls(cameraPaco, renderer.domElement);
const controlsCato = new OrbitControls(cameraCato, renderer.domElement);

// Cámara activa por defecto
let activeCamera = cameraPaco;
let activeControls = controlsPaco;

// Luces
const ambientLight = new THREE.AmbientLight(0xffffff, 1);
scene.add(ambientLight);

// Cargar texturas
const textureLoader = new THREE.TextureLoader();
const texturaCato1 = textureLoader.load('PACOSI/CATRIEL4/baseColor_1.jpg');
const texturaCato2 = textureLoader.load('PACOSI/CATRIEL4/baseColor_2.jpg');
const texturaPacoFront = textureLoader.load('PACOSI/pacofinal/baseColor_1.jpg');
const texturaPacoBack = textureLoader.load('PACOSI/pacofinal/baseColor_2.jpg');

// Cargar modelos GLTF
let modeladopaco, modeladoCATO;
const gltfLoader = new GLTFLoader();

// Cargar el modelo PACO
gltfLoader.load('PACOSI/pacofinal/pacoinflaoOG_final.gltf', function (gltf) {
    modeladopaco = gltf.scene;
    modeladopaco.scale.set(1, 1, 1);
    modeladopaco.position.set(20, 0, 0); // Más cerca de CATO

    modeladopaco.traverse((child) => {
        if (child.isMesh) {
            child.material = child.material || new THREE.MeshStandardMaterial();
            if (child.name.includes('Front')) {
                child.material.map = texturaPacoFront;
            } else if (child.name.includes('Back')) {
                child.material.map = texturaPacoBack;
            }
            child.material.needsUpdate = true;
        }
    });

    scene.add(modeladopaco);
}, undefined, function (error) {
    console.error('Error al cargar pacoOG3.gltf:', error);
});

// Cargar el modelo CATRIEL
gltfLoader.load('PACOSI/CATRIEL4/CATRIEL4.gltf', function (gltf) {
    modeladoCATO = gltf.scene;
    modeladoCATO.scale.set(1, 1, 1);
    modeladoCATO.position.set(2, 0, 0); // Más cerca de PACO

    modeladoCATO.traverse((child) => {
        if (child.isMesh) {
            child.material = child.material || new THREE.MeshStandardMaterial();
            if (child.name.includes('Part1')) {
                child.material.map = texturaCato1;
            } else if (child.name.includes('Part2')) {
                child.material.map = texturaCato2;
            }
            child.material.needsUpdate = true;
        }
    });

    scene.add(modeladoCATO);
}, undefined, function (error) {
    console.error('Error al cargar CATRIEL4.gltf:', error);
});

// Cambiar de modelo al hacer clic
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

window.addEventListener('click', (event) => {
    // Normalizar coordenadas del mouse
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, activeCamera);
    const intersects = raycaster.intersectObjects([modeladopaco, modeladoCATO], true);

    if (intersects.length > 0) {
        const clickedObject = intersects[0].object.parent;

        if (clickedObject === modeladopaco) {
            activeCamera = cameraPaco;
            activeControls = controlsPaco;
            console.log("Cambiado a control de PACO");
        } else if (clickedObject === modeladoCATO) {
            activeCamera = cameraCato;
            activeControls = controlsCato;
            console.log("Cambiado a control de CATO");
        }
    }
});

// Animación de flotación y renderizado
let angle = 0;
function animate() {
    requestAnimationFrame(animate);

    angle += 0.01;
    if (modeladopaco) modeladopaco.position.y = Math.sin(angle) * 0.5;
    if (modeladoCATO) modeladoCATO.position.y = Math.sin(angle) * 0.5;

    activeControls.update();
    renderer.render(scene, activeCamera);
}
animate();

// Ajuste del tamaño al cambiar la ventana
window.addEventListener('resize', () => {
    cameraPaco.aspect = window.innerWidth / window.innerHeight;
    cameraPaco.updateProjectionMatrix();
    cameraCato.aspect = window.innerWidth / window.innerHeight;
    cameraCato.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
