import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import type { CountryData } from './data';
import { createStylizedEarthTexture } from './earthTexture';

export interface GlobeSceneOptions {
  canvasRef: { current: HTMLCanvasElement | null };
  earthMeshRef: { current: THREE.Mesh | null };
  targetRotationRef: { current: [number, number] | null };
  selectedCountryRef: { current: CountryData | null };
  isRotatingRef: { current: boolean };
  isHoveredRef: { current: boolean };
  highlightedCountries: CountryData[];
  onWebglError: () => void;
}

// Convert Lat/Lng to 3D Cartesian coordinates using standard Three.js SphereGeometry equirectangular projection
function convertLatLngToVector3(lat: number, lng: number, radius: number): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);

  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const y = radius * Math.cos(phi);
  const z = radius * Math.sin(phi) * Math.sin(theta);

  return new THREE.Vector3(x, y, z);
}

/**
 * Owns the interactive three.js globe: earth sphere, texture fallback chain,
 * atmosphere glow, lights, drag-rotate with inertia, auto-rotation, country pins
 * and HTML label projection. Scene is (re)built whenever `highlightedCountries` changes.
 */
export function useGlobeScene({
  canvasRef,
  earthMeshRef,
  targetRotationRef,
  selectedCountryRef,
  isRotatingRef,
  isHoveredRef,
  highlightedCountries,
  onWebglError,
}: GlobeSceneOptions): void {
  const earthGroupRef = useRef<THREE.Group | null>(null);
  const isDraggingRef = useRef(false);
  const rotationVelocityX = useRef(0);
  const rotationVelocityY = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || highlightedCountries.length === 0) return;

    let isPointerDragging = false;
    let previousX = 0;
    let previousY = 0;

    // Pointer listeners directly bound to canvas for dragging/orbiting
    const handlePointerDown = (e: PointerEvent) => {
      isPointerDragging = true;
      isDraggingRef.current = true;
      previousX = e.clientX;
      previousY = e.clientY;
      targetRotationRef.current = null; // Intercept centering transitions immediately on manual drag
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (!isPointerDragging) return;
      const dx = e.clientX - previousX;
      const dy = e.clientY - previousY;

      if (earthMeshRef.current) {
        const earthMesh = earthMeshRef.current;
        // Update rotation of the Earth sphere directly (Y: longitude/spin, X: latitude/tilt)
        earthMesh.rotation.y += dx * 0.005;
        earthMesh.rotation.x -= dy * 0.005;

        // Clamp vertical axis so user cannot rotate Earth completely upside down, allowing wide flexible tilt (up to ~109 degrees)
        earthMesh.rotation.x = Math.max(-Math.PI / 1.65, Math.min(Math.PI / 1.65, earthMesh.rotation.x));
      }

      // Record velocities for smooth inertia momentum decay
      rotationVelocityY.current = dx * 0.005;
      rotationVelocityX.current = -dy * 0.005;

      previousX = e.clientX;
      previousY = e.clientY;
    };

    const handlePointerUpOrCancel = () => {
      isPointerDragging = false;
      setTimeout(() => {
        isDraggingRef.current = false;
      }, 50);
    };

    canvas.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUpOrCancel);
    canvas.addEventListener('pointercancel', handlePointerUpOrCancel);

    // Three.js Scene Setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 1000);
    camera.position.z = 5.2;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        antialias: true,
        alpha: true
      });
    } catch (err) {
      console.error("WebGL context creation failed! Falling back to 2D holographic vector radar grid.", err);
      onWebglError();
      return;
    }
    renderer.setSize(500, 500);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Balanced soft ambient light to illuminate the full globe beautifully without dark spots
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.4);
    scene.add(ambientLight);

    // Soft directional lighting to add realistic 3D depth without harsh spotlight hotspots
    const dirLight1 = new THREE.DirectionalLight(0xffffff, 0.5);
    dirLight1.position.set(5, 3, 5);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0xffffff, 0.5);
    dirLight2.position.set(-5, -3, -5);
    scene.add(dirLight2);

    const earthGroup = new THREE.Group();
    // Set the Earth's real physical axial tilt connecting the North Pole to the South Pole (approx 23.4 degrees)
    earthGroup.rotation.z = -23.4 * (Math.PI / 180);
    scene.add(earthGroup);
    earthGroupRef.current = earthGroup;

    // Earth Sphere
    const earthGeo = new THREE.SphereGeometry(1.8, 64, 64);
    const textureLoader = new THREE.TextureLoader();
    textureLoader.setCrossOrigin('anonymous');
    
    // Balanced materials with fallback capabilities
    const earthMat = new THREE.MeshStandardMaterial({
      color: 0xffffff, // Use pure white to display the texture in its full vibrant glory
      roughness: 0.8, // eliminate high specularity spotlight sheen for uniform visibility
      metalness: 0.1,
    });

    // Try loading with JSdelivr first (highest reliability CDN), then unpkg, then procedural fallback
    const earthTexture = textureLoader.load(
      'https://cdn.jsdelivr.net/npm/three-globe/example/img/earth-blue-marble.jpg',
      (texture) => {
        earthMat.map = texture;
        earthMat.needsUpdate = true;
      },
      undefined,
      (err) => {
        console.warn("Failed to load earth texture from JSdelivr, trying unpkg...", err);
        textureLoader.load(
          'https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg',
          (texture) => {
            earthMat.map = texture;
            earthMat.needsUpdate = true;
          },
          undefined,
          (err2) => {
            console.error("Failed to load earth texture from unpkg, falling back to procedural stylized colors", err2);
            const fallbackTexture = createStylizedEarthTexture();
            earthMat.map = fallbackTexture;
            earthMat.needsUpdate = true;
          }
        );
      }
    );

    earthMat.map = earthTexture;

    const earthMesh = new THREE.Mesh(earthGeo, earthMat);
    earthMesh.rotation.order = 'YXZ';
    earthGroup.add(earthMesh);
    earthMeshRef.current = earthMesh;

    // Glowing Atmosphere Layer
    const glowGeo = new THREE.SphereGeometry(1.815, 32, 32);
    const glowMat = new THREE.MeshBasicMaterial({
      color: 0x06b6d4,
      transparent: true,
      opacity: 0.15,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide
    });
    const glowMesh = new THREE.Mesh(glowGeo, glowMat);
    earthGroup.add(glowMesh);

    // Create 3D pins as children of earthMesh (so they rotate perfectly with the sphere)
    const pinMeshes: THREE.Mesh[] = [];
    highlightedCountries.forEach((country) => {
      const pinPos = convertLatLngToVector3(country.lat, country.lng, 1.805);
      const coreGeo = new THREE.SphereGeometry(0.045, 16, 16);
      
      const isSelected = selectedCountryRef.current?.id === country.id;
      const coreMat = new THREE.MeshBasicMaterial({
        color: isSelected ? 0xf59e0b : 0x06b6d4,
      });
      const coreMesh = new THREE.Mesh(coreGeo, coreMat);
      coreMesh.position.copy(pinPos);
      earthMesh.add(coreMesh);
      pinMeshes.push(coreMesh);
    });

    let animationFrameId: number;
    const tempV = new THREE.Vector3();

    const animate = () => {
      // 1. Check hover and dragging state to determine auto-rotation vs inertia vs idle
      if (!isHoveredRef.current && !isPointerDragging) {
        // If we have active drag momentum, decay it (inertia)
        if (Math.abs(rotationVelocityY.current) > 0.0001 || Math.abs(rotationVelocityX.current) > 0.0001) {
          earthMesh.rotation.y += rotationVelocityY.current;
          earthMesh.rotation.x += rotationVelocityX.current;
          // Clamp vertical axis so inertia stays within wide flexible limits
          earthMesh.rotation.x = Math.max(-Math.PI / 1.65, Math.min(Math.PI / 1.65, earthMesh.rotation.x));
          rotationVelocityY.current *= 0.95;
          rotationVelocityX.current *= 0.95;
        } else if (!targetRotationRef.current) {
          // Smoothly restore the polar axis direction (x-rotation back to 0) so the spin connects North to South Pole
          if (Math.abs(earthMesh.rotation.x) > 0.01) {
            // First smoothly restore the axis direction
            earthMesh.rotation.x += (0 - earthMesh.rotation.x) * 0.05;
          } else {
            // Ensure the axis is fully aligned to standard polar orientation
            earthMesh.rotation.x = 0;
            // Then start rotating in the axis so that rotation feels real and smooth and consistent
            if (isRotatingRef.current) {
              earthMesh.rotation.y += 0.002;
            }
          }
        }
      } else if (!isPointerDragging) {
        // Paused on hover: decay drag momentum if any exists
        earthMesh.rotation.y += rotationVelocityY.current;
        earthMesh.rotation.x += rotationVelocityX.current;
        earthMesh.rotation.x = Math.max(-Math.PI / 1.65, Math.min(Math.PI / 1.65, earthMesh.rotation.x));
        rotationVelocityY.current *= 0.95;
        rotationVelocityX.current *= 0.95;
      }

      // 2. Smooth centering transition to targeted country
      if (targetRotationRef.current) {
        const [tx, ty] = targetRotationRef.current;
        earthMesh.rotation.x += (tx - earthMesh.rotation.x) * 0.08;
        earthMesh.rotation.y += (ty - earthMesh.rotation.y) * 0.08;

        if (Math.abs(tx - earthMesh.rotation.x) < 0.005 && Math.abs(ty - earthMesh.rotation.y) < 0.005) {
          targetRotationRef.current = null;
        }
      }

      // Force update of world matrix to ensure getWorldPosition calculates accurately
      scene.updateMatrixWorld(true);

      renderer.render(scene, camera);

      // 3. Project 3D pin locations to floating absolute HTML overlay elements using robust world coordinates
      highlightedCountries.forEach((country, idx) => {
        const el = document.getElementById(`globe-pin-label-${country.id}`);
        if (!el) return;

        const pinMesh = pinMeshes[idx];
        if (!pinMesh) return;

        pinMesh.getWorldPosition(tempV);
        const isFacingCamera = tempV.z > 0;

        tempV.project(camera);

        if (isFacingCamera) {
          const x = (tempV.x * 0.5 + 0.5) * 500;
          const y = (-(tempV.y * 0.5) + 0.5) * 500;

          el.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -100%)`;
          el.style.opacity = '1';
          el.style.pointerEvents = 'auto';
        } else {
          el.style.opacity = '0';
          el.style.pointerEvents = 'none';
        }

        // Live update pin colors dynamically from selectedCountryRef
        const pinMeshObj = pinMeshes[idx];
        if (pinMeshObj && pinMeshObj.material) {
          const isSelected = selectedCountryRef.current?.id === country.id;
          (pinMeshObj.material as THREE.MeshBasicMaterial).color.setHex(isSelected ? 0xf59e0b : 0x06b6d4);
        }
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      earthGroupRef.current = null;
      earthMeshRef.current = null;
      cancelAnimationFrame(animationFrameId);
      canvas.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUpOrCancel);
      canvas.removeEventListener('pointercancel', handlePointerUpOrCancel);
      renderer.dispose();
      earthGeo.dispose();
      earthMat.dispose();
      glowGeo.dispose();
      glowMat.dispose();
      pinMeshes.forEach(mesh => {
        mesh.geometry.dispose();
        if (Array.isArray(mesh.material)) {
          mesh.material.forEach(m => m.dispose());
        } else {
          mesh.material.dispose();
        }
      });
    };
    // Depend ONLY on highlightedCountries so scene is constructed once on mount!
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [highlightedCountries]);
}
