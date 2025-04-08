import * as THREE from "three";
import { OrbitControls } from "jsm/controls/OrbitControls.js";

const w = window.innerWidth;
const h = window.innerHeight;
const renderer = new THREE.WebGLRenderer( {antialias: true});
renderer.setSize(w,h);
document.body.appendChild(renderer.domElement);
const fov  = 35;
const aspect = w / h;
const near = 0.1;
const far = 1000;
const zoom = 50;
const camera = new THREE.OrthographicCamera( w / - zoom, w / zoom, h / zoom, h / - zoom, 1, 1000 );
camera.position.z = 30;
const scene = new THREE.Scene();

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.1;

const wireMat = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    wireframe: true
})

const points = [];
points.push( new THREE.Vector3(-10, 0,0));
points.push( new THREE.Vector3(0,10,0));
points.push( new THREE.Vector3(10,0,0));

const geometry = new THREE.BufferGeometry().setFromPoints(points);
const line = new THREE.Line(geometry, wireMat);
scene.add(line);

const hemiLight = new THREE.HemisphereLight(0x0099ff, 0xaa5500);
scene.add(hemiLight);

function animate(t = 0) {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}
animate();

