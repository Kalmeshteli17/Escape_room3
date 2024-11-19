// boundingBoxes.js

import * as THREE from 'three';

/**
 * Creates a bounding box mesh with specified parameters.
 *
 * @param {THREE.Vector3} position - The position of the bounding box.
 * @param {THREE.Euler} rotation - The rotation of the bounding box in radians.
 * @param {THREE.Vector3} scale - The scale of the bounding box.
 * @param {number} color - The color of the bounding box wireframe.
 * @returns {THREE.Mesh} - The bounding box mesh.
 */
export function createBoundingBox(position, rotation, scale, color = 0xff0000) {
    const geometry = new THREE.BoxGeometry(1, 1, 1); // Unit cube
    const material = new THREE.MeshBasicMaterial({
        color: color,
        wireframe: true,
    });

    const boundingBox = new THREE.Mesh(geometry, material);
    boundingBox.scale.set(scale.x, scale.y, scale.z);
    boundingBox.rotation.set(rotation.x, rotation.y, rotation.z);
    boundingBox.position.set(position.x, position.y, position.z);

    return boundingBox;
}

/**
 * List of bounding boxes for collision detection.
 */
export const boundingBoxesList = [];

/**
 * Adds predefined bounding boxes to the scene.
 *
 * @param {THREE.Scene} scene - The Three.js scene to which bounding boxes will be added.
 */
export function addBoundingBoxes(scene) {
    const boundingBoxesParams = [
        {
            position: new THREE.Vector3(3.630, 1.001, 4.223),
            rotation: new THREE.Euler(0, THREE.MathUtils.degToRad(90), 0),
            scale: new THREE.Vector3(16.714, 2, 1),
            color: 0x00ff00,
            name: 'Wall_1',
        },
        // Add more bounding boxes here as needed
    ];

    boundingBoxesParams.forEach((params) => {
        const box = createBoundingBox(params.position, params.rotation, params.scale, params.color);
        box.name = params.name || 'BoundingBox';
        scene.add(box);

        // Add bounding box to the list for collision detection
        const box3 = new THREE.Box3().setFromObject(box);
        boundingBoxesList.push(box3);
    });
}
