"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

// Real coordinates of the 15 hubs
const HUBS = [
  { name: "Singapore", lat: 1.29, lng: 103.85 },
  { name: "Rotterdam", lat: 51.95, lng: 4.14 },
  { name: "Memphis", lat: 35.04, lng: -89.98 },
  { name: "Dubai", lat: 24.90, lng: 55.16 },
  { name: "Shanghai", lat: 30.63, lng: 122.05 },
  { name: "Los Angeles", lat: 33.74, lng: -118.27 },
  { name: "Frankfurt", lat: 50.03, lng: 8.57 },
  { name: "Tokyo", lat: 35.77, lng: 140.39 },
  { name: "New York", lat: 40.64, lng: -73.78 },
  { name: "London", lat: 51.47, lng: -0.45 },
  { name: "Mumbai", lat: 18.93, lng: 72.95 },
  { name: "Sydney", lat: -33.94, lng: 151.18 },
  { name: "Amsterdam", lat: 52.31, lng: 4.76 },
  { name: "Hong Kong", lat: 22.31, lng: 113.91 },
  { name: "Istanbul", lat: 41.26, lng: 28.74 }
];

// 10 route arcs with correct color coding
const ROUTES = [
  { start: 14, end: 12, status: "ALERT", color: 0xf43f5e },      // Rose
  { start: 4,  end: 1,  status: "ALERT", color: 0xf43f5e },      // Rose
  { start: 9,  end: 3,  status: "DELIVERED", color: 0x10b981 },  // Emerald
  { start: 0,  end: 10, status: "DELIVERED", color: 0x10b981 },  // Emerald
  { start: 1,  end: 6,  status: "DELIVERED", color: 0x10b981 },  // Emerald
  { start: 8,  end: 9,  status: "IN_TRANSIT", color: 0x22d3ee }, // Cyan
  { start: 5,  end: 7,  status: "IN_TRANSIT", color: 0x22d3ee }, // Cyan
  { start: 7,  end: 11, status: "IN_TRANSIT", color: 0x22d3ee }, // Cyan
  { start: 13, end: 0,  status: "IN_TRANSIT", color: 0x22d3ee }, // Cyan
  { start: 2,  end: 5,  status: "IN_TRANSIT", color: 0x22d3ee }  // Cyan
];

// Helper to convert lat/lng to 3D sphere coordinate
const convertLatLngToVector3 = (lat: number, lng: number, radius: number) => {
  const latRad = (lat * Math.PI) / 180;
  const lngRad = (lng * Math.PI) / 180;
  const x = radius * Math.cos(latRad) * Math.cos(lngRad);
  const y = radius * Math.sin(latRad);
  const z = radius * Math.cos(latRad) * Math.sin(lngRad);
  return new THREE.Vector3(x, y, z);
};

export default function ShipmentGlobe() {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // 1. SCENE SETUP
    const scene = new THREE.Scene();
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);

    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 0, 5.2);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.enablePan = false;
    controls.minDistance = 3.2;
    controls.maxDistance = 8.5;

    // Lights for 3D realism
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);
    const dirLight = new THREE.DirectionalLight(0x22d3ee, 1.2);
    dirLight.position.set(5, 5, 5);
    scene.add(dirLight);

    const globeGroup = new THREE.Group();
    scene.add(globeGroup);

    // 2. EARTH APPEARANCE
    const radius = 2.0;

    // Main Sphere (Navy #0a0f1e)
    const globeGeo = new THREE.SphereGeometry(radius, 64, 64);
    const globeMat = new THREE.MeshStandardMaterial({
      color: 0x0a0f1e,
      roughness: 0.7,
      metalness: 0.1,
    });
    const globeMesh = new THREE.Mesh(globeGeo, globeMat);
    globeGroup.add(globeMesh);

    // Wireframe Overlay (Cyan #22d3ee, slightly larger)
    const wireframeGeo = new THREE.IcosahedronGeometry(2.01, 4);
    const wireframeMat = new THREE.MeshBasicMaterial({
      color: 0x22d3ee,
      wireframe: true,
      transparent: true,
      opacity: 0.14,
    });
    const wireframeMesh = new THREE.Mesh(wireframeGeo, wireframeMat);
    globeGroup.add(wireframeMesh);

    // Atmosphere Glow Shader (Radius 2.2, Rim glow BackSide)
    const atmosphereGeo = new THREE.SphereGeometry(2.2, 62, 62);
    const atmosphereMat = new THREE.ShaderMaterial({
      vertexShader: `
        varying vec3 vNormal;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec3 vNormal;
        void main() {
          float intensity = pow(0.78 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.5);
          gl_FragColor = vec4(vec3(0.13, 0.83, 0.94), intensity * 0.45);
        }
      `,
      transparent: true,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    const atmosphereMesh = new THREE.Mesh(atmosphereGeo, atmosphereMat);
    globeGroup.add(atmosphereMesh);

    // 3. HUB MARKERS
    const hubRings: THREE.Mesh[] = [];
    const hubPositions = HUBS.map((hub) => {
      const pos = convertLatLngToVector3(hub.lat, hub.lng, radius);

      // Inner dot: bright cyan sphere
      const innerDot = new THREE.Mesh(
        new THREE.SphereGeometry(0.024, 16, 16),
        new THREE.MeshStandardMaterial({
          color: 0x22d3ee,
          emissive: 0x22d3ee,
          emissiveIntensity: 2.0
        })
      );
      innerDot.position.copy(pos);
      globeGroup.add(innerDot);

      // Outer ring flat on surface
      const ringGeo = new THREE.RingGeometry(0.04, 0.052, 32);
      const ringMat = new THREE.MeshBasicMaterial({
        color: 0x22d3ee,
        transparent: true,
        opacity: 0.8,
        side: THREE.DoubleSide
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.position.copy(pos);
      ring.lookAt(pos.clone().multiplyScalar(1.5));
      globeGroup.add(ring);
      hubRings.push(ring);

      // Vertical fading beam
      const beamHeight = 0.75;
      const beamGeo = new THREE.CylinderGeometry(0.003, 0.016, beamHeight, 8, 1, true);
      beamGeo.translate(0, beamHeight / 2, 0); // Base shift
      const beamMat = new THREE.ShaderMaterial({
        vertexShader: `
          varying vec2 vUv;
          void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: `
          varying vec2 vUv;
          void main() {
            float fade = 1.0 - vUv.y;
            fade = pow(fade, 1.8);
            gl_FragColor = vec4(vec3(0.13, 0.83, 0.94), fade * 0.75);
          }
        `,
        transparent: true,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      });
      const beam = new THREE.Mesh(beamGeo, beamMat);
      beam.position.copy(pos);
      beam.lookAt(pos.clone().multiplyScalar(2.0));
      beam.rotateX(Math.PI / 2);
      globeGroup.add(beam);

      return pos;
    });

    // 4. ROUTE ARCS
    const routesData: Array<{
      curve: THREE.QuadraticBezierCurve3;
      dot: THREE.Mesh;
      progress: number;
      speed: number;
    }> = [];

    ROUTES.forEach((route) => {
      const startPos = hubPositions[route.start];
      const endPos = hubPositions[route.end];

      const distance = startPos.distanceTo(endPos);
      const elevation = 0.32 + distance * 0.18;
      const midPos = startPos
        .clone()
        .add(endPos)
        .multiplyScalar(0.5)
        .normalize()
        .multiplyScalar(radius + elevation);

      const curve = new THREE.QuadraticBezierCurve3(startPos, midPos, endPos);

      // Draw curve path
      const points = curve.getPoints(50);
      const arcGeo = new THREE.BufferGeometry().setFromPoints(points);
      const arcMat = new THREE.LineBasicMaterial({
        color: route.color,
        transparent: true,
        opacity: 0.55
      });
      const arcLine = new THREE.Line(arcGeo, arcMat);
      globeGroup.add(arcLine);

      // Traveling sphere dot
      const dotGeo = new THREE.SphereGeometry(0.034, 12, 12);
      const dotMat = new THREE.MeshBasicMaterial({ color: route.color });
      const dot = new THREE.Mesh(dotGeo, dotMat);
      globeGroup.add(dot);

      // Duration: 3 - 5s staggered loops
      const duration = 3.0 + Math.random() * 2.0;
      const speed = 1.0 / (60 * duration);

      routesData.push({
        curve,
        dot,
        progress: Math.random(),
        speed
      });
    });

    // 5. PARTICLE FIELD (3000 orbiting stars with mouse deflection)
    const particleCount = 3000;
    const positions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      const dist = 2.1 + Math.random() * 4.4;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);

      positions[i * 3] = dist * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = dist * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = dist * Math.cos(phi);
    }

    const particleGeo = new THREE.BufferGeometry();
    particleGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));

    const particleMat = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uMouse3D: { value: new THREE.Vector3(0, 0, 0) },
        uHasMouse: { value: 0.0 }
      },
      vertexShader: `
        uniform float uTime;
        uniform vec3 uMouse3D;
        uniform float uHasMouse;
        varying vec3 vPosition;
        varying float vDistFromCenter;

        void main() {
          vec3 pos = position;

          // Slow orbital drift
          float angle = uTime * 0.02 + pos.y * 0.01;
          float c = cos(angle);
          float s = sin(angle);
          float rx = pos.x * c - pos.z * s;
          float rz = pos.x * s + pos.z * c;
          pos.x = rx;
          pos.z = rz;

          // Mouse deflection
          if (uHasMouse > 0.5) {
            float dist = distance(pos, uMouse3D);
            if (dist < 1.7) {
              vec3 dir = normalize(pos - uMouse3D);
              float push = (1.7 - dist) * 0.32;
              pos += dir * push;
            }
          }

          vPosition = pos;
          vDistFromCenter = length(pos);

          vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
          gl_PointSize = (1.8 / -mvPosition.z) * 11.0;
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        varying vec3 vPosition;
        varying float vDistFromCenter;

        void main() {
          float r = length(gl_PointCoord - vec2(0.5));
          if (r > 0.5) discard;

          vec3 white = vec3(1.0, 1.0, 1.0);
          vec3 cyan = vec3(0.13, 0.83, 0.94);

          vec3 color = white;
          if (vDistFromCenter < 3.0) {
            float blend = clamp((3.0 - vDistFromCenter) / 0.9, 0.0, 1.0);
            color = mix(white, cyan, blend);
          }

          float alpha = (1.0 - r * 2.0) * 0.8;
          gl_FragColor = vec4(color, alpha);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // 6. SCAN RING ANIMATION ON CLICK
    const scanRingGeo = new THREE.RingGeometry(2.02, 2.05, 64);
    const scanRingMat = new THREE.MeshBasicMaterial({
      color: 0x22d3ee,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.0,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });
    const scanRing = new THREE.Mesh(scanRingGeo, scanRingMat);
    scanRing.rotation.x = Math.PI / 2;
    scanRing.visible = false;
    globeGroup.add(scanRing);

    let scanActive = false;
    let scanY = 2.0;

    // Mouse Tracking Raycaster
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    const mouse3D = new THREE.Vector3();
    let hasMouse3D = false;
    let isHovered = false;

    const onMouseMove = (e: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const testSphere = new THREE.Sphere(new THREE.Vector3(0, 0, 0), 2.8);
      const intersectPoint = new THREE.Vector3();

      if (raycaster.ray.intersectSphere(testSphere, intersectPoint)) {
        mouse3D.copy(intersectPoint);
        hasMouse3D = true;
      } else {
        hasMouse3D = false;
      }
    };

    const onMouseEnter = () => {
      isHovered = true;
    };

    const onMouseLeave = () => {
      isHovered = false;
      hasMouse3D = false;
    };

    const onClick = () => {
      scanActive = true;
      scanY = 2.0;
    };

    container.addEventListener("mousemove", onMouseMove);
    container.addEventListener("mouseenter", onMouseEnter);
    container.addEventListener("mouseleave", onMouseLeave);
    container.addEventListener("click", onClick);

    // Resize Handler
    const onResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener("resize", onResize);

    // Animation Loop
    const clock = new THREE.Clock();
    let rafId = 0;

    const animate = () => {
      rafId = window.requestAnimationFrame(animate);

      const elapsedTime = clock.getElapsedTime();
      const delta = clock.getDelta(); // Needs to be called but we'll use elapsedTime for trig

      // Globe auto-rotation deceleration on hover
      const rotationSpeed = isHovered ? 0.0002 : 0.0008;
      globeGroup.rotation.y += rotationSpeed;

      // Pulse outer hub circles
      const pulseScale = 1.0 + Math.sin(elapsedTime * 4.5) * 0.28;
      hubRings.forEach((ring) => {
        ring.scale.set(pulseScale, pulseScale, 1);
      });

      // Animate Bezier route nodes
      routesData.forEach((route) => {
        route.progress += route.speed;
        if (route.progress > 1) {
          route.progress = 0;
        }
        route.dot.position.copy(route.curve.getPoint(route.progress));
      });

      // Pass time and mouse coordinates to particle shader
      particleMat.uniforms.uTime.value = elapsedTime;
      if (hasMouse3D && isHovered) {
        // Convert to local coordinates of the particle object if rotated
        const localMouse = mouse3D.clone();
        particleMat.uniforms.uMouse3D.value.copy(localMouse);
        particleMat.uniforms.uHasMouse.value = 1.0;
      } else {
        particleMat.uniforms.uHasMouse.value = 0.0;
      }

      // Scan Sweep
      if (scanActive) {
        scanY -= 0.045;
        if (scanY < -2.0) {
          scanActive = false;
          scanRing.visible = false;
        } else {
          scanRing.visible = true;
          scanRing.position.y = scanY;
          // Calculate cross section radius of sphere: r_slice = sqrt(R^2 - y^2)
          const sliceRad = Math.sqrt(Math.max(0.01, 4.04 - scanY * scanY));
          scanRing.scale.set(sliceRad, sliceRad, 1);
          // Fade opacity out near poles
          scanRingMat.opacity = Math.max(0, Math.sin(Math.acos(scanY / 2.01))) * 0.85;
        }
      }

      controls.update();
      renderer.render(scene, camera);
    };

    animate();

    // Cleanups
    return () => {
      window.cancelAnimationFrame(rafId);
      window.removeEventListener("resize", onResize);
      container.removeEventListener("mousemove", onMouseMove);
      container.removeEventListener("mouseenter", onMouseEnter);
      container.removeEventListener("mouseleave", onMouseLeave);
      container.removeEventListener("click", onClick);
      controls.dispose();

      scene.traverse((obj) => {
        const mesh = obj as THREE.Mesh;
        if (mesh.geometry) mesh.geometry.dispose();
        const material = mesh.material;
        if (Array.isArray(material)) {
          material.forEach((m) => m.dispose());
        } else if (material) {
          material.dispose();
        }
      });
      renderer.dispose();

      if (renderer.domElement.parentElement === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {/* CSS Simulated Ambient Glow Circle for Bloom Overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-40 blur-xl scale-95" style={{ filter: "drop-shadow(0 0 35px rgba(34, 211, 238, 0.45))" }}>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-60 h-60 rounded-full bg-cyan-500/10" />
      </div>
      <div ref={containerRef} className="h-full w-full relative z-10" />
    </div>
  );
}
