import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import GUI from 'lil-gui';

let galaxy;
let particleGeometry;
let particleMaterial;

//GUI

const params = {
  count: 350000,
  size: 0.01,
  radius: 5,
  branches: 3,
  spin: 1,
  randomness: 0.2,
  randomnessPower: 3,
  insideColor: '#2eafff',
  outsideColor: '#e538c0'
}

const gui = new GUI();
gui.add(params, 'count').min(100).max(1000000).step(100).onFinishChange(createGalaxy);
gui.add(params, 'size').min(0.001).max(0.1).step(0.001).onFinishChange(createGalaxy);
gui.add(params, 'radius').min(1).max(10).step(0.1).onFinishChange(createGalaxy);
gui.add(params, 'branches').min(2).max(15).step(1).onFinishChange(createGalaxy);
gui.add(params, 'spin').min(- 5).max(5).step(0.001).onFinishChange(createGalaxy);
gui.add(params, 'randomness').min(0).max(2).step(0.001).onFinishChange(createGalaxy);
gui.add(params, 'randomnessPower').min(1).max(10).step(0.001).onFinishChange(createGalaxy);
gui.addColor(params, 'insideColor').onFinishChange(createGalaxy);
gui.addColor(params, 'outsideColor').onFinishChange(createGalaxy);

//Scene 

const scene = new THREE.Scene();

//Sizes

const sizes = {
  width: window.innerWidth,
  height: window.innerHeight
};

window.addEventListener('resize', () => {
  // Update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  // Update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // Update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

//Camera

const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height);
camera.position.z = 7;
camera.position.y = 5;
camera.position.x = 0;
scene.add(camera);


//Objects

function createGalaxy() {
  if (galaxy) {
    particleGeometry.dispose();
    particleMaterial.dispose();
    scene.remove(galaxy)
  }

  //Positions

  const positions = new Float32Array(params.count * 3);
  const colors = new Float32Array(params.count * 3);

  for (let i = 0; i < params.count; i++) {

    const i3 = i * 3;

    const radius = Math.random() * params.radius;
    const branchAngle = i % params.branches / params.branches * (Math.PI * 2);
    const spinAngle = params.spin * radius;

    const randomX = Math.pow(Math.random(), params.randomnessPower) * (Math.random() < 0.5 ? 1 : -1) * params.randomness * radius;
    const randomY = Math.pow(Math.random(), params.randomnessPower) * (Math.random() < 0.5 ? 1 : -1) * params.randomness * radius;
    const randomZ = Math.pow(Math.random(), params.randomnessPower) * (Math.random() < 0.5 ? 1 : -1) * params.randomness * radius;

    positions[i3] = Math.cos(branchAngle + spinAngle) * radius + randomX;
    positions[i3 + 1] = randomY;
    positions[i3 + 2] = Math.sin(branchAngle + spinAngle) * radius + randomZ;

    //Colors

    const outsideColor = new THREE.Color(params.outsideColor);

    const mixedColor = new THREE.Color(params.insideColor);
    mixedColor.lerp(outsideColor, radius / params.radius);

    colors[i3    ] = mixedColor.r;
    colors[i3 + 1] = mixedColor.g;
    colors[i3 + 2] = mixedColor.b;

  }

  //Geometry

  particleGeometry = new THREE.BufferGeometry();
  particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  //Material

  particleMaterial = new THREE.PointsMaterial({
    size: params.size,
    sizeAttenuation: true,
    depthWrite: false,
    vertexColors: true,
    blending: THREE.AdditiveBlending
  });

  galaxy = new THREE.Points(particleGeometry, particleMaterial);
  scene.add(galaxy);
}

createGalaxy();

//Renderer

const canvas = document.getElementById('webgl');

const renderer = new THREE.WebGLRenderer({ canvas: canvas });
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

renderer.render(scene, camera)

//Controls

const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

//Animations

const clock = new THREE.Clock();

function tick() {

  const elapsedTime = clock.getElapsedTime();

  //Update Material

  // Update controls
  controls.update();

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();