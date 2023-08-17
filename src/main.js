import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'dat.gui'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'

// Canvas
const canvas = document.querySelector('canvas.app')
const gui = new dat.GUI()
let airplaneShouldMove =false ;
// const canvas = document.getElementById("scene");
const scene = new THREE.Scene()
class Plane {
    constructor(model) {
      this.model = model;

    }
  
    get geometry() {
      return this.model.geometry;
    }
  
    set position(position) {
      this.model.position.copy(position);
    }
  
    get position() {
      return this.model.position.clone();
    }
  
    set rotation(rotation) {
      this.model.rotation.copy(rotation);
    }
  
    get rotation() {
      return this.model.rotation.clone();
    }
  
    // Additional methods can be added as per your requirements
  }
  


const loadingManager = new THREE.LoadingManager()
loadingManager.onStart = () =>
{
    console.log('loadingManager: loading started')
}
loadingManager.onLoaded = () =>
{
    console.log('loadingManager: loading finished')
}
loadingManager.onProgress = () =>
{
    console.log('loadingManager: loading progressing')
}
loadingManager.onError = () =>
{
    console.log('loadingManager: loading error')
}

const textureLoader = new THREE.TextureLoader(loadingManager)

const grassColorTexture = textureLoader.load('/static/land/texture-grey.jpg');
const grassMetalnessTexture = textureLoader.load("static/land/metalness.png");
const grassAmbientOcclusionTexture = textureLoader.load("static/land/ambientOcclusion.png");
const grassNormalTexture = textureLoader.load("static/land/normal.png");
const grassRoughnessTexture = textureLoader.load("static/land/roughness.png");
const grassHeightTexture = textureLoader.load("static/land/height.png");
grassColorTexture.repeat.set(250, 250);
grassAmbientOcclusionTexture.repeat.set(150, 150);
grassNormalTexture.repeat.set(150, 150);
grassRoughnessTexture.repeat.set(150, 150);
grassHeightTexture.repeat.set(150, 150);
grassMetalnessTexture.repeat.set(150, 150);

grassColorTexture.wrapS = THREE.RepeatWrapping;
grassAmbientOcclusionTexture.wrapS = THREE.RepeatWrapping;
grassNormalTexture.wrapS = THREE.RepeatWrapping;
grassRoughnessTexture.wrapS = THREE.RepeatWrapping;
grassHeightTexture.wrapS = THREE.RepeatWrapping;
grassMetalnessTexture.wrapS = THREE.RepeatWrapping;

grassColorTexture.wrapT = THREE.RepeatWrapping;
grassAmbientOcclusionTexture.wrapT = THREE.RepeatWrapping;
grassNormalTexture.wrapT = THREE.RepeatWrapping;
grassRoughnessTexture.wrapT = THREE.RepeatWrapping;
grassHeightTexture.wrapT = THREE.RepeatWrapping;
grassMetalnessTexture.wrapT = THREE.RepeatWrapping;

//textures
const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(1000, 1000, 1, 1),
    new THREE.MeshBasicMaterial({
        map: grassColorTexture,
    })  
);
floor.material.roughness = 0.05;
floor.geometry.setAttribute("uv2",
    new THREE.Float32BufferAttribute(floor.geometry.attributes.uv.array, 2)
);
floor.rotation.x = -Math.PI / 2;
scene.add(floor);

// light
const light = new THREE.AmbientLight(0xffffff, 1.3);
light.position.set(0, 8000000, 1000000)
scene.add(light)

const light3 = new THREE.DirectionalLight(0xffffff, 1.5);
light3.position.set(0, 8000, 10000000)
//scene.add(light3)

const glftloader = new GLTFLoader(loadingManager);

const dracoLoader = new DRACOLoader()
glftloader.setDRACOLoader(dracoLoader)
let plane ;
let planeGe;
let isModelLoaded = false;

glftloader.load('/static/airplane/plane.glb'
, function ( gltf ) {
     plane = gltf.scene;
     planeGe = plane.children[0].geometry ;
     console.log(plane.children[0].geometry)
     plane.scale.set(1, 1, 1)
     //plane.rotateY((-Math.PI ) - 0.04)
     plane.position.set(0, 3.5, -1)
    
  
    scene.add(plane);
    isModelLoaded =true;
    //scene.add(gltf.scene);
}, undefined, function ( error ) {

	console.error( error );

} );
const cubeTextureLoader = new THREE.CubeTextureLoader();
const cubeTexture = cubeTextureLoader.load([
    "/static/Daylight Box_Right.bmp",
    "/static/Daylight Box_Left.bmp",
    "/static/Daylight Box_Top.bmp",
    "/static/Daylight Box_Bottom.bmp",
    "/static/Daylight Box_Front.bmp",
    "/static/Daylight Box_Back.bmp",
]);

scene.background = cubeTexture;

const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
  //  camera.aspect = sizes.width / sizes.height
   // camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})
document.addEventListener("keydown", onDocumentKeyDown, false);
function onDocumentKeyDown(event) {
    var keyCode = event.which;
    if (keyCode == '32') {
      airplaneShouldMove = true;
    }
};

 


const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0 , 0 , 0);
//camera.rotateY(Math.PI / 2);


// Base camera
// const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
// camera.position.x = 0
// camera.position.y = 1
// camera.position.z = 15
 scene.add(camera)




const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

// Controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableRotate = false;




///////////physics///////////



var wingArea = 20; // m^2
var thrustCoefficient = 5;
var wingSpan = 10; // m
var liftCoefficient = 180;
var wingChord = wingArea / wingSpan; // m

var airplaneMass = 50;
//gui.add({ airplaneMass: airplaneMass }, 'airplaneMass', 0, 100, 10);
var gravity = 9.8; // m/s^2
var angleOfAttack = 5 * Math.PI / 180; // radians

var pitchAngle = angleOfAttack * (180 / Math.PI); // initial pitch angle
var dragCoefficient = 1;

// Define the airplane max speed
const airplaneMaxSpeed = 2;

// Define the airplane direction
let airplaneDirection = 0;

var velocity = new THREE.Vector3(0, 0, 0); // initial velocity
var acceleration = new THREE.Vector3(0, 0, 0); // initial acceleration
var pitchAngle = angleOfAttack * (180 / Math.PI); // initial pitch angle

let angularVelocity = new THREE.Vector3();
var airDensity = 1.225; // kg/m^3


const cYaw = 0; // coefficient of yawing y moment
const cRoll = 0; // coefficient of roll z moment
const cPitch = 0; // coefficient of pitch x moment
const P = 1.2;
//gui.add({ cN: cN }, 'cN', 0, 1, 0.1);

const parameters = {
  airplaneMass: airplaneMass,
  cYaw: cYaw,
  cRoll:cRoll,
  cPitch:cPitch,
};

// GUI controls setup
const airplaneFolder = gui.addFolder('Airplane Parameters');

airplaneFolder.add(parameters, 'airplaneMass', 0, 100);
airplaneFolder.add(parameters, 'cYaw', -1, 1);
airplaneFolder.add(parameters, 'cRoll', -1, 1);
airplaneFolder.add(parameters, 'cPitch', -1, 1);



function updateAirplane() {

const { airplaneMass, cYaw, cRoll,cPitch } = parameters;
console.log(airplaneMass)

console.log(cYaw)
  var dragForce = new THREE.Vector3(
    0,
    0, 
   0.5* airDensity * velocity.length() * velocity.length() * wingArea * dragCoefficient);


  var liftForce = new THREE.Vector3(
    0,
  0.5 * airDensity * velocity.length() * velocity.length() * wingArea * liftCoefficient * Math.sin(angleOfAttack),
    0);


  var thrustForce = new THREE.Vector3(
    0,
    0,
    -0.5 * airDensity * velocity.length() * velocity.length() * wingArea * thrustCoefficient);


  var weightForce = new THREE.Vector3(
    0,
   - (airplaneMass ) * gravity ,
    0);

 
  var netForce = (weightForce.clone().add(dragForce).add(liftForce).add(thrustForce));
  acceleration = (netForce.divideScalar( airplaneMass ));
  velocity.add(acceleration);
  //acceleration = thrustVector;
 
  //console.log(acceleration);
 
  velocity.addScalar(netForce.z);
 // console.log(velocity);

  pitchAngle += velocity.x * 0.05; // pitch up/down based on horizontal velocity


  if (velocity.length() > airplaneMaxSpeed) {
      velocity.setLength(airplaneMaxSpeed);
  }

  
   if ( plane.position.y > 1500 ){
    plane.position.y = 1500;


   }

   if ( plane.position.y <1){
    return;


    


   }


   //////cn
  
 

// Define airplane's angular velocity and torque vectors
var angularVelocity = new THREE.Vector3(0, 0, 0); // initial angular velocity

var yaw = new THREE.Vector3(
  0,

  0.5 *velocity.length() * velocity.length() * cYaw * P  * wingArea * wingSpan*2, // yaw torque

  0

 ); 

    var roll = new THREE.Vector3(
      0,

     0,
    
     -0.5 *velocity.length() * velocity.length() * cRoll  * P  * wingArea * wingSpan); // roll torque



     var pitch = new THREE.Vector3(
      -0.5 *velocity.length() * velocity.length() * cPitch  * P  * wingArea * wingSpan ,// pitch torque

      0,

      0
    
     ); 

const distance = 2; // distance from center of rotation (in meters)

// Define time step and time
const dt = 0.01; // time step (in seconds)



  // Calculate angular acceleration
 // const angulaAcceleration = pitch.clone().multiplyScalar(1 / distance);
  //const angulaAcceleration = roll.clone().multiplyScalar(1 / distance);
 // const angulaAcceleration = yaw.clone().multiplyScalar(1 / distance);
 var angulaAcceleration = new THREE.Vector3(
    pitch.clone().multiplyScalar(1/distance),
    yaw.clone().multiplyScalar(1 / distance),
    roll.clone().multiplyScalar(1 / distance)
  );
  // Update angular velocity and position
  angularVelocity.add(angulaAcceleration.y.clone().multiplyScalar(dt)).add(angulaAcceleration.x.clone().multiplyScalar(dt)).add(angulaAcceleration.z.clone().multiplyScalar(dt));

  plane.position.applyAxisAngle(angularVelocity.clone().normalize(), angularVelocity.length() * dt);
  

plane.rotation.y = angularVelocity.y;

plane.rotation.z = angularVelocity.z;

plane.rotation.x = angularVelocity.x;

 


  airplaneDirection += netForce.z *0.00001;
  
 
  
  plane.position.z -= velocity.z ;
 
  plane.position.y +=  velocity.y ;
  
  const cameraDistance = 20;
  const cameraHeight = 5;
  const cameraX = plane.position.x ;
  const cameraY = plane.position.y ;
  const cameraZ = plane.position.z ;
  camera.position.set(cameraX , cameraY +10, cameraZ -25);
  camera.lookAt(plane.position);

 console.log(plane.position);
 
}


const clock = new THREE.Clock()

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()
   gui.updateDisplay()
    if (isModelLoaded) {
        if( airplaneShouldMove){
          updateAirplane();
        }
    
   // // Render
   renderer.render(scene, camera)
        
    }
   // Call tick again on the next frame
   window.requestAnimationFrame(tick)

}


tick()