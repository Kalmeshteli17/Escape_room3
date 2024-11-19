import * as THREE from "three";

export default function PuzzleTwo(scene, camera, doors) {
  // Generate a random target color with 2 decimal places
  const targetColor = {
    r: parseFloat((Math.random()).toFixed(2)),
    g: parseFloat((Math.random()).toFixed(2)),
    b: parseFloat((Math.random()).toFixed(2)),
  };

  console.log("Target Color:", targetColor); // Log target color to the console

  const playerColor = { r: 0.5, g: 0.5, b: 0.5 };

  // Create target color display for Puzzle Two (Positioned in a new room)
  const targetMaterial = new THREE.MeshStandardMaterial({
    color: new THREE.Color(targetColor.r, targetColor.g, targetColor.b),
  });
  const targetDisplay = new THREE.Mesh(
    new THREE.BoxGeometry(1, 1, 0.1),
    targetMaterial
  );
  targetDisplay.position.set(10, 1, -4); // New location for the puzzle
  scene.add(targetDisplay);

  // Create player color display for Puzzle Two
  const playerMaterial = new THREE.MeshStandardMaterial({
    color: new THREE.Color(playerColor.r, playerColor.g, playerColor.b),
  });
  const playerDisplay = new THREE.Mesh(
    new THREE.BoxGeometry(1, 1, 0.1),
    playerMaterial
  );
  playerDisplay.position.set(12, 1, -4); // New location for the player color
  scene.add(playerDisplay);

  let door; // Reference to the door for PuzzleTwo
  const targetDoorPosition = new THREE.Vector3(-6.740, 1, 4.178); // Target position for the door (new location)
  let doorMoving = false; // Flag to indicate if the door is moving

  // Find the door object
  const findDoor = () => {
    door = scene.getObjectByName("door_2"); // Change to door_2 for PuzzleTwo
    if (!door) {
      console.warn("Door with name 'door_2' not found in the scene.");
    }
  };

  // Update player color and check solution
  function updateColor() {
    playerMaterial.color.setRGB(playerColor.r, playerColor.g, playerColor.b);
    checkSolution();
  }

  function checkSolution() {
    // Ensure playerColor and targetColor are defined and have the necessary properties
    if (
      playerColor && targetColor && 
      typeof playerColor.r === "number" &&
      typeof playerColor.g === "number" &&
      typeof playerColor.b === "number" &&
      typeof targetColor.r === "number" &&
      typeof targetColor.g === "number" &&
      typeof targetColor.b === "number"
    ) {
      // Check if the colors are close enough to be considered a match
      if (
        Math.abs(playerColor.r - targetColor.r) < 0.05 &&
        Math.abs(playerColor.g - targetColor.g) < 0.05 &&
        Math.abs(playerColor.b - targetColor.b) < 0.05
      ) {
        alert("Puzzle solved!");
        console.log("Puzzle Solved! Colors Matched!");
        doorMoving = true; // Start moving the door
      }
    } else {
      console.error("playerColor or targetColor is not defined or is missing properties.");
    }
  }

  // Animate door movement
  function animateDoor() {
    if (door && doorMoving) {
      door.position.lerp(targetDoorPosition, 0.05); // Smooth movement

      if (door.position.distanceTo(targetDoorPosition) < 0.01) {
        door.position.copy(targetDoorPosition);
        doorMoving = false; // Stop movement once the door reaches the target position
        console.log("Door has reached its target position!");
      }

      // Update door bounding box after movement
      doors[1].setFromObject(door); // Update door bounding box for door_2
    }
  }

  // Animation Loop
  function tick() {
    animateDoor();
    requestAnimationFrame(tick);
  }
  tick();

  // Wait for door to be added to the scene
  setTimeout(findDoor, 1000); // Adjust delay if necessary

  return () => {
    scene.remove(targetDisplay);
    scene.remove(playerDisplay);
  };
}


