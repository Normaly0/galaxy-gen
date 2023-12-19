import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import GUI from 'lil-gui';

import fragmentShader  from './shaders/galaxy/fragmentShader.glsl';
import vertexShader  from './shaders/galaxy/vertexShader.glsl';

let galaxy;
let particleGeometry;
let particleMaterial;

//GUI

const params = {
  count: 350000,
  size: 15,
  radius: 5,
  branches: 3,
  spin: 1,
  randomness: 0.2,
  randomnessPower: 3,
  insideColor: '#2eafff',
  outsideColor: '#e538c0',
  animate: false
}

const gui = new GUI();
gui.add(params, 'count').min(100).max(1000000).step(100).onFinishChange(createGalaxy);
gui.add(params, 'size').min(1).max(25).step(1).onFinishChange(createGalaxy);
gui.add(params, 'radius').min(1).max(10).step(0.1).onFinishChange(createGalaxy);
gui.add(params, 'branches').min(2).max(15).step(1).onFinishChange(createGalaxy);
gui.add(params, 'spin').min(- 5).max(5).step(0.001).onFinishChange(createGalaxy);
gui.add(params, 'randomness').min(0).max(2).step(0.001).onFinishChange(createGalaxy);
gui.add(params, 'randomnessPower').min(1).max(10).step(0.001).onFinishChange(createGalaxy);
gui.addColor(params, 'insideColor').onFinishChange(createGalaxy);
gui.addColor(params, 'outsideColor').onFinishChange(createGalaxy);
gui.add(params, 'animate');

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

  const positions = new Float32Array(params.count * 3);
  const colors = new Float32Array(params.count * 3);
  const scales = new Float32Array(params.count);
  const randomPos = new Float32Array(params.count * 3);

  for (let i = 0; i < params.count; i++) {

    const i3 = i * 3;

    //Positions

    const radius = Math.random() * params.radius;
    const branchAngle = i % params.branches / params.branches * (Math.PI * 2);
    const spinAngle = params.spin * radius;

    const randomX = Math.pow(Math.random(), params.randomnessPower) * (Math.random() < 0.5 ? 1 : -1) * params.randomness * radius;
    const randomY = Math.pow(Math.random(), params.randomnessPower) * (Math.random() < 0.5 ? 1 : -1) * params.randomness * radius;
    const randomZ = Math.pow(Math.random(), params.randomnessPower) * (Math.random() < 0.5 ? 1 : -1) * params.randomness * radius;

    positions[i3] = Math.cos(branchAngle + spinAngle) * radius;
    positions[i3 + 1] = 0;
    positions[i3 + 2] = Math.sin(branchAngle + spinAngle) * radius;

    //Random scale 

    scales[i] = Math.random();

    //Random positions

    randomPos[i3    ] = randomX;
    randomPos[i3 + 1] = randomY;
    randomPos[i3 + 2] = randomZ;

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
  particleGeometry.setAttribute('aScale', new THREE.BufferAttribute(scales, 1));
  particleGeometry.setAttribute('aRandomPos', new THREE.BufferAttribute(randomPos, 3));

  //Material

  particleMaterial = new THREE.ShaderMaterial({
    depthWrite: false,
    vertexColors: true,
    blending: THREE.AdditiveBlending,
    vertexShader: vertexShader,
    fragmentShader: fragmentShader,
    uniforms: {
      uSize: {value: params.size * Math.min(window.devicePixelRatio, 2)},
      uTime: {value: 0}
    }
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
  if (params.animate) {
    particleMaterial.uniforms.uTime.value += 0.015;
  }

  // Update controls
  controls.update();

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();