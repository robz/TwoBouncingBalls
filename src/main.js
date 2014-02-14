/*jslint browser:true */
/*globals CANNON, THREE, requestAnimationFrame */

var linkThreeToCannon = function (body, mesh) {
    "use strict";
    
    var parent = {
		setPosition: body.position.set,
        setQuaternion: body.quaternion.set
    };
    
    body.position.set = function (x, y, z) {
        parent.setPosition.call(body, arguments);
        body.position.copy(mesh.position);
    };
    
    body.quaternion.set = function (x, y, z) {
        parent.setQuaternion.call(body, arguments);
        body.quaternion.copy(mesh.quaternion);
    };
};

(function () {
    "use strict";
    
    var scene, camera, light, renderer, cameraControls, world,
        ballMesh, ballMaterial, ballBody,
        groundMesh, groundMaterial, groundBody,
        ballMesh2, ballMaterial2, ballBody2;
     
    //
    // Graphics stuff
    //
    scene = new THREE.Scene();
	
    renderer = new THREE.WebGLRenderer();
	renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);
    
    camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 1, 10000);
    camera.position.set(0, 100, -200);
    camera.lookAt(scene.position);
    
    cameraControls = new THREE.OrbitControls(camera, renderer.domElement);
    
    ballMesh = new THREE.Mesh(
        new THREE.SphereGeometry(10),
        new THREE.MeshPhongMaterial({color: 0x00FF00})
	);
    scene.add(ballMesh);
    
    ballMesh2 = new THREE.Mesh(
        new THREE.SphereGeometry(10),
        new THREE.MeshPhongMaterial({color: 0x00FF00})
	);
    scene.add(ballMesh2);
    
    groundMesh = new THREE.Mesh(
        new THREE.CubeGeometry(100, 100, 0.01),
        new THREE.MeshPhongMaterial({color: 0x0000FF})
    );
    scene.add(groundMesh);
    
    light = new THREE.HemisphereLight(0xFFFFFF, 0x111111, 1.0);
    light.position.set(100, 100, 0);
    scene.add(light);
    
    //
    // Physics stuff
    //
    world = new CANNON.World();
    world.gravity.set(0, -9.82, 0);
    world.broadphase = new CANNON.NaiveBroadphase();
    
    ballMaterial = new CANNON.Material("ball");
    ballBody = new CANNON.RigidBody(5, new CANNON.Sphere(10), ballMaterial);
    ballBody.position.set(0, 50, 0);
    world.add(ballBody);
    
    ballBody2 = new CANNON.RigidBody(5, new CANNON.Sphere(10), ballMaterial);
    ballBody2.position.set(0, 80, 0);
    linkThreeToCannon(ballBody2, ballMesh2);
    world.add(ballBody2);
    
    groundMaterial = new CANNON.Material("ground");
    groundBody = new CANNON.RigidBody(0, new CANNON.Plane(), groundMaterial);
    linkThreeToCannon(groundBody, groundMesh);
    groundBody.position.set(0, -20, 0);
    groundBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2);
    groundBody.quaternion.copy(groundMesh.quaternion);
    world.add(groundBody);
    
    world.addContactMaterial(new CANNON.ContactMaterial(ballMaterial, groundMaterial, 0.0, 1.0));
    world.addContactMaterial(new CANNON.ContactMaterial(ballMaterial, ballMaterial, 0.0, 1.0));
    
    //
    // Main loop
    //
    (function iterate() {
		requestAnimationFrame(iterate);
        world.step(1 / 60);
        ballBody.position.copy(ballMesh.position);
        ballBody2.position.copy(ballMesh2.position);
        renderer.render(scene, camera);
        cameraControls.update();
    }());
}());