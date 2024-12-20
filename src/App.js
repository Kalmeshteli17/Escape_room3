import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { PointerLockControls } from "three/examples/jsm/controls/PointerLockControls";
import PuzzleOne from "./PuzzleOne";


const App = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const sizes = {
      width: window.innerWidth,
      height: window.innerHeight,
    };

    // Scene and Renderer setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87ceeb);

    const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 1000);
    camera.position.set(0, 1.2, -2);
    scene.add(camera);

    const renderer = new THREE.WebGLRenderer({ canvas: canvasRef.current });
    renderer.setSize(sizes.width, sizes.height);

    // PointerLockControls
    const controls = new PointerLockControls(camera, renderer.domElement);
    canvasRef.current.addEventListener("click", () => {
      controls.lock();
    });

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    // Load Model
    const loader = new GLTFLoader();
    const modelUrl = new URL("./scene_pro2.glb", import.meta.url);

    loader.load(
      modelUrl.href,
      (gltf) => {
        const model = gltf.scene;
        scene.add(model);
      },
      undefined,
      (error) => {
        console.error("Error loading the GLB model:", error);
      }
    );

    // Doors and Bounding Boxes
    const doors = [];

    // Add door_1 (plane)
    const geometry = new THREE.PlaneGeometry(1, 2);
    const material = new THREE.MeshBasicMaterial({ color: 0xff0000, side: THREE.DoubleSide });
    const door1 = new THREE.Mesh(geometry, material);
    door1.position.set(0, 1, 4.178);
    door1.scale.set(1, 2, 1);
    door1.name = "door_1";
    scene.add(door1);
    doors.push(new THREE.Box3().setFromObject(door1));

    // Add door_2 (plane)
    const geometry2 = new THREE.PlaneGeometry(1, 2);
    const material2 = new THREE.MeshBasicMaterial({ color: 0x00ff00, side: THREE.DoubleSide });
    const door2 = new THREE.Mesh(geometry2, material2);
    door2.position.set(-6.740, 1, 4.178);
    door2.scale.set(1, 2, 1);
    door2.name = "door_2";
    scene.add(door2);
    doors.push(new THREE.Box3().setFromObject(door2));

    // Add door_3 (plane)
    const geometry3 = new THREE.PlaneGeometry(1, 2);
    const material3 = new THREE.MeshBasicMaterial({ color: 0x0000ff, side: THREE.DoubleSide });
    const door3 = new THREE.Mesh(geometry3, material3);
    door3.position.set(-3.641, 1, 10.861);
    door3.scale.set(1, 2, 1);
    door3.rotation.set(0, THREE.MathUtils.degToRad(90), 0);
    door3.name = "door_3";
    scene.add(door3);
    doors.push(new THREE.Box3().setFromObject(door3));

    // Walls/Obstacles for collision
    const obstacles = [];

    // Wall 1
    const wallGeometry = new THREE.BoxGeometry(16.714, 2, 1);
    const wallMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00, wireframe: true });
    const wall1 = new THREE.Mesh(wallGeometry, wallMaterial);
    wall1.position.set(3.630, 1.001, 4.223);
    wall1.rotation.y = THREE.MathUtils.degToRad(90);
    scene.add(wall1);
    obstacles.push(new THREE.Box3().setFromObject(wall1));

    // Wall 2
    const wall2 = new THREE.Mesh(wallGeometry, wallMaterial);
    wall2.position.set(-10.808, 1.001, 4.223);
    wall2.rotation.y = THREE.MathUtils.degToRad(90);
    scene.add(wall2);
    obstacles.push(new THREE.Box3().setFromObject(wall2));

    // Movement Controls
    const movement = { forward: false, backward: false, left: false, right: false };
    const speed = 5;

    const handleKeyDown = (event) => {
      switch (event.code) {
        case "KeyW":
          movement.forward = true;
          break;
        case "KeyS":
          movement.backward = true;
          break;
        case "KeyA":
          movement.left = true;
          break;
        case "KeyD":
          movement.right = true;
          break;
      }
    };

    const handleKeyUp = (event) => {
      switch (event.code) {
        case "KeyW":
          movement.forward = false;
          break;
        case "KeyS":
          movement.backward = false;
          break;
        case "KeyA":
          movement.left = false;
          break;
        case "KeyD":
          movement.right = false;
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    // Animation Loop
    const clock = new THREE.Clock();

    const tick = () => {
      const delta = clock.getDelta();
      const direction = new THREE.Vector3();
      camera.getWorldDirection(direction);
      direction.y = 0;
      direction.normalize();

      const nextPosition = controls.object.position.clone();

      if (movement.forward) {
        nextPosition.add(direction.clone().multiplyScalar(speed * delta));
      }
      if (movement.backward) {
        nextPosition.add(direction.clone().multiplyScalar(-speed * delta));
      }

      const sideDirection = new THREE.Vector3().crossVectors(camera.up, direction).normalize();
      if (movement.left) {
        nextPosition.add(sideDirection.multiplyScalar(speed * delta));
      }
      if (movement.right) {
        nextPosition.add(sideDirection.multiplyScalar(-speed * delta));
      }

      // Check for collisions with doors and walls
      const playerBox = new THREE.Box3().setFromCenterAndSize(
        nextPosition.clone(),
        new THREE.Vector3(0.5, 1.8, 0.5) // Approximate player's size
      );

      let collision = false;
      for (const doorBox of doors) {
        if (playerBox.intersectsBox(doorBox)) {
          collision = true;
          break;
        }
      }

      for (const obstacleBox of obstacles) {
        if (playerBox.intersectsBox(obstacleBox)) {
          collision = true;
          break;
        }
      }

      // Only update position if no collision
      if (!collision) {
        controls.object.position.copy(nextPosition);
      }

      renderer.render(scene, camera);
      requestAnimationFrame(tick);
    };

    tick();

    // Puzzle Initialization
    const cleanupPuzzle = PuzzleOne(scene, doors);


    // Handle Window Resize
    const handleResize = () => {
      sizes.width = window.innerWidth;
      sizes.height = window.innerHeight;
      camera.aspect = sizes.width / sizes.height;
      camera.updateProjectionMatrix();
      renderer.setSize(sizes.width, sizes.height);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      cleanupPuzzle();
    };
  }, []);

  return <canvas ref={canvasRef} className="webgl" />;
};

export default App;