/**
 * Momentum X - Scene Management Class
 * Manages Three.js scene, lighting, and 3D environment
 */

import * as THREE from 'three';
import {
    GAME_CONFIG,
    TIME_STATES,
    randomBetween,
    lerp,
    createNeonMaterial
} from './utils.js';

class Scene {
    constructor() {
        // Three.js core components
        this.scene = null;
        this.camera = null;
        this.renderer = null;

        // Environment objects
        this.environmentObjects = []; // Objects that scroll (buildings, decorations)
        this.staticObjects = []; // Objects that don't scroll (ground, lane markers)
        this.lights = {};
        this.ground = null;
        this.laneMarkers = [];

        // Scene configuration
        this.fogColor = 0x000000;
        this.fogNear = 50;
        this.fogFar = 200;
    }

    /**
     * Initialize the Three.js scene, camera, and renderer
     * @param {HTMLElement} container - DOM container for the renderer
     * @returns {boolean} - Success status
     */
    init(container) {
        try {
            // Create scene
            this.scene = new THREE.Scene();
            this.scene.fog = new THREE.Fog(this.fogColor, this.fogNear, this.fogFar);

            // Get container dimensions (full viewport)
            const containerWidth = window.innerWidth;
            const containerHeight = window.innerHeight;

            // Create camera
            this.camera = new THREE.PerspectiveCamera(
                GAME_CONFIG.CAMERA_FOV,
                containerWidth / containerHeight,
                GAME_CONFIG.CAMERA_NEAR,
                GAME_CONFIG.CAMERA_FAR
            );

            // Set camera position
            this.camera.position.set(
                GAME_CONFIG.CAMERA_POSITION.x,
                GAME_CONFIG.CAMERA_POSITION.y,
                GAME_CONFIG.CAMERA_POSITION.z
            );

            // Make camera look slightly downward to show more ground
            this.camera.lookAt(0, -0.2, -5);

            // Create renderer
            this.renderer = new THREE.WebGLRenderer({
                antialias: true,
                alpha: true
            });
            this.renderer.setSize(containerWidth, containerHeight);
            this.renderer.setClearColor(this.fogColor, 1);
            this.renderer.shadowMap.enabled = true;
            this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

            // Add renderer to container with proper positioning
            this.renderer.domElement.style.position = 'absolute';
            this.renderer.domElement.style.top = '0';
            this.renderer.domElement.style.left = '0';
            this.renderer.domElement.style.margin = '0';
            this.renderer.domElement.style.padding = '0';
            container.appendChild(this.renderer.domElement);

            // Initialize environment
            this.initializeEnvironment();

            console.log('Scene initialized successfully');
            return true;

        } catch (error) {
            console.error('Error initializing scene:', error);
            return false;
        }
    }

    /**
     * Initialize 3D environment with lighting and basic geometry
     */
    initializeEnvironment() {
        // Setup cyberpunk lighting
        this.setupLighting();

        // Create ground plane
        this.createGround();

        // Create lane markers
        this.createLaneMarkers();

        // Create initial environment objects
        this.createEnvironmentObjects();

        console.log('3D environment initialized');
    }

    /**
     * Setup cyberpunk-themed lighting
     */
    setupLighting() {
        // Ambient light for overall illumination
        this.lights.ambient = new THREE.AmbientLight(0x404040, 0.3);
        this.scene.add(this.lights.ambient);

        // Main directional light (moonlight effect)
        this.lights.directional = new THREE.DirectionalLight(0x8080ff, 0.8);
        this.lights.directional.position.set(10, 20, 10);
        this.lights.directional.castShadow = true;
        this.lights.directional.shadow.mapSize.width = 2048;
        this.lights.directional.shadow.mapSize.height = 2048;
        this.scene.add(this.lights.directional);

        // Cyan accent light from the left
        this.lights.leftAccent = new THREE.PointLight(0x00ffff, 1, 50);
        this.lights.leftAccent.position.set(-20, 10, 0);
        this.scene.add(this.lights.leftAccent);

        // Magenta accent light from the right
        this.lights.rightAccent = new THREE.PointLight(0xff0080, 1, 50);
        this.lights.rightAccent.position.set(20, 10, 0);
        this.scene.add(this.lights.rightAccent);
    }

    /**
     * Create ground plane
     */
    createGround() {
        const geometry = new THREE.PlaneGeometry(100, 1000); // Much larger ground
        const material = new THREE.MeshPhongMaterial({
            color: 0x111111,
            transparent: true,
            opacity: 0.8
        });

        this.ground = new THREE.Mesh(geometry, material);
        this.ground.rotation.x = -Math.PI / 2; // Rotate to be horizontal
        this.ground.position.y = -1;
        this.ground.receiveShadow = true;

        this.scene.add(this.ground);
        this.staticObjects.push(this.ground);
    }

    /**
     * Create visual lane markers for the three-lane system
     */
    createLaneMarkers() {
        const laneMarkerGeometry = new THREE.BoxGeometry(0.2, 0.1, 1000); // Much longer markers
        const laneMarkerMaterial = createNeonMaterial(0x00ffff, 0.3);

        // Create markers between lanes
        for (let i = 0; i < GAME_CONFIG.LANE_COUNT - 1; i++) {
            const markerX = (GAME_CONFIG.LANE_POSITIONS[i] + GAME_CONFIG.LANE_POSITIONS[i + 1]) / 2;
            const marker = new THREE.Mesh(laneMarkerGeometry, laneMarkerMaterial);
            marker.position.set(markerX, 0, -500); // Center the longer markers
            marker.castShadow = true;

            this.scene.add(marker);
            this.laneMarkers.push(marker);
            this.staticObjects.push(marker);
        }
    }

    /**
     * Create basic environment objects (buildings, decorations)
     */
    createEnvironmentObjects() {
        // Create simple building-like structures on the sides
        for (let i = 0; i < 10; i++) {
            // Left side buildings
            const leftBuilding = this.createBuilding();
            leftBuilding.position.set(-15 + randomBetween(-5, 5), 0, -20 * i);
            this.scene.add(leftBuilding);
            this.environmentObjects.push(leftBuilding);

            // Right side buildings
            const rightBuilding = this.createBuilding();
            rightBuilding.position.set(15 + randomBetween(-5, 5), 0, -20 * i);
            this.scene.add(rightBuilding);
            this.environmentObjects.push(rightBuilding);
        }
    }

    /**
     * Create a simple building structure
     * @returns {THREE.Group} - Building group
     */
    createBuilding() {
        const building = new THREE.Group();

        // Main building structure
        const height = randomBetween(5, 15);
        const width = randomBetween(3, 8);
        const depth = randomBetween(3, 8);

        const geometry = new THREE.BoxGeometry(width, height, depth);
        const material = new THREE.MeshPhongMaterial({
            color: 0x222222,
            emissive: 0x001122,
            emissiveIntensity: 0.1
        });

        const buildingMesh = new THREE.Mesh(geometry, material);
        buildingMesh.position.y = height / 2;
        buildingMesh.castShadow = true;
        buildingMesh.receiveShadow = true;

        building.add(buildingMesh);

        // Add some neon accents
        if (Math.random() > 0.5) {
            const accentGeometry = new THREE.BoxGeometry(width * 0.1, height * 0.8, depth * 1.1);
            const accentMaterial = createNeonMaterial(
                Math.random() > 0.5 ? 0x00ffff : 0xff0080,
                0.4
            );

            const accent = new THREE.Mesh(accentGeometry, accentMaterial);
            accent.position.y = height / 2;
            building.add(accent);
        }

        return building;
    }

    /**
     * Update environment objects (scrolling effect)
     * @param {number} deltaTime - Time since last update in seconds
     * @param {number} timeMultiplier - Time effect multiplier
     */
    updateEnvironment(deltaTime, timeMultiplier = 1.0) {
        // Move environment objects towards camera (simulating forward movement)
        this.environmentObjects.forEach(obj => {
            obj.position.z += GAME_CONFIG.ENVIRONMENT_SCROLL_SPEED * timeMultiplier * deltaTime;

            // Reset position when object has passed camera
            if (obj.position.z > 20) {
                obj.position.z -= 200;
            }
        });
    }

    /**
     * Update camera to follow player lane changes smoothly
     * @param {number} deltaTime - Time since last update in seconds
     * @param {number} targetX - Target X position to follow
     */
    updateCamera(deltaTime, targetX = 0) {
        // Smooth camera following
        const currentX = this.camera.position.x;
        const newX = lerp(currentX, targetX, GAME_CONFIG.CAMERA_FOLLOW_SPEED * deltaTime);

        this.camera.position.x = newX;
        this.camera.lookAt(targetX, -0.2, -5);
    }

    /**
     * Apply time power effects to lighting
     * @param {string} timeState - Current time state
     */
    applyTimeEffects(timeState) {
        switch (timeState) {
            case TIME_STATES.FROZEN:
                // Blue tint for freeze effect
                this.lights.ambient.color.setHex(0x4040ff);
                this.lights.directional.intensity = 0.5;
                break;

            case TIME_STATES.SLOW:
                // Purple tint for slow effect
                this.lights.ambient.color.setHex(0x8040ff);
                this.lights.directional.intensity = 0.6;
                break;

            case TIME_STATES.FAST:
                // Red tint for speed effect
                this.lights.ambient.color.setHex(0xff4040);
                this.lights.directional.intensity = 1.2;
                break;

            default:
                // Normal lighting
                this.lights.ambient.color.setHex(0x404040);
                this.lights.directional.intensity = 0.8;
                break;
        }
    }

    /**
     * Render the scene
     */
    render() {
        if (this.renderer && this.scene && this.camera) {
            this.renderer.render(this.scene, this.camera);
        }
    }

    /**
     * Add object to scene
     * @param {THREE.Object3D} object - Object to add
     */
    addObject(object) {
        this.scene.add(object);
    }

    /**
     * Remove object from scene
     * @param {THREE.Object3D} object - Object to remove
     */
    removeObject(object) {
        this.scene.remove(object);
    }

    /**
     * Get scene reference
     * @returns {THREE.Scene} - Three.js scene
     */
    getScene() {
        return this.scene;
    }

    /**
     * Get camera reference
     * @returns {THREE.Camera} - Three.js camera
     */
    getCamera() {
        return this.camera;
    }

    /**
     * Get renderer reference
     * @returns {THREE.WebGLRenderer} - Three.js renderer
     */
    getRenderer() {
        return this.renderer;
    }

    /**
     * Resize the scene
     * @param {number} width - New width
     * @param {number} height - New height
     */
    resize(width, height) {
        if (this.camera && this.renderer) {
            this.camera.aspect = width / height;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(width, height);
        }
    }

    /**
     * Clean up resources
     */
    dispose() {
        if (this.renderer) {
            this.renderer.dispose();
        }

        // Dispose of geometries and materials
        const allObjects = [...this.environmentObjects, ...this.staticObjects];
        allObjects.forEach(obj => {
            if (obj.geometry) obj.geometry.dispose();
            if (obj.material) {
                if (Array.isArray(obj.material)) {
                    obj.material.forEach(mat => mat.dispose());
                } else {
                    obj.material.dispose();
                }
            }
        });
    }
}
//Export the Scene class
export { Scene };