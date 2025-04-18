import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

export default function SimulationRenderer() {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);

  useEffect(() => {
    if (!mountRef.current) return;
    const mountRefCurrent = mountRef.current;

    try {
      // Scene setup
      const scene = new THREE.Scene();
      sceneRef.current = scene;

      // Camera setup
      const camera = new THREE.PerspectiveCamera(
        75,
        mountRef.current.clientWidth / mountRef.current.clientHeight,
        0.1,
        1000
      );
      camera.position.x = 10;
      camera.position.z = 5;

      // Orbits
      const orbit = new THREE.EllipseCurve(
        0,
        0,
        15,
        10,
        0,
        Math.PI * 2,
        false,
        0
      );

      const points = orbit.getPoints(100);
      const ellipseGeometry = new THREE.BufferGeometry().setFromPoints(points);
      const ellipseMaterial = new THREE.LineBasicMaterial({ color: 0xffffff });
      const ellipse = new THREE.Line(ellipseGeometry, ellipseMaterial);

      ellipse.rotation.x = 20 * (Math.PI / 180) + Math.PI / 2;
      ellipse.rotation.y = 30 * (Math.PI / 180); // inlination
      ellipse.rotation.z = 20 * (-Math.PI / 180); // rotation

      scene.add(ellipse);

      // Renderer setup
      const renderer = new THREE.WebGLRenderer({ antialias: true });
      renderer.setSize(
        mountRef.current.clientWidth,
        mountRef.current.clientHeight
      );
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
      mountRef.current.appendChild(renderer.domElement);
      rendererRef.current = renderer;

      // OrbitControls setup
      new OrbitControls(camera, renderer.domElement);

      // earth setup

      const earthGroup = new THREE.Group();
      earthGroup.rotation.z = (23.4 * Math.PI) / 180;
      scene.add(earthGroup);
      new OrbitControls(camera, renderer.domElement);
      const detail = 12;
      const loader = new THREE.TextureLoader();
      const geometry = new THREE.IcosahedronGeometry(6.378, detail);
      const material = new THREE.MeshPhongMaterial({
        map: loader.load("/textures/00_earthmap1k.jpg"),
        // specularMap: loader.load("/textures/02_earthspec1k.jpg"),
        // bumpMap: loader.load("/textures/01_earthbump1k.jpg"),
        // bumpScale: 0.04,
      });
      // material.map.colorSpace = THREE.SRGBColorSpace;
      const earthMesh = new THREE.Mesh(geometry, material);
      earthGroup.add(earthMesh);

      const lightsMat = new THREE.MeshBasicMaterial({
        map: loader.load("/textures/03_earthlights1k.jpg"),
        blending: THREE.AdditiveBlending,
      });
      const lightsMesh = new THREE.Mesh(geometry, lightsMat);
      // earthGroup.add(lightsMesh);

      const cloudsMat = new THREE.MeshStandardMaterial({
        map: loader.load("/textures/04_earthcloudmap.jpg"),
        transparent: true,
        opacity: 0.5,
        blending: THREE.AdditiveBlending,
        alphaMap: loader.load("/textures/05_earthcloudmaptrans.jpg"),
        // alphaTest: 0.3,
      });
      const cloudsMesh = new THREE.Mesh(geometry, cloudsMat);
      cloudsMesh.scale.setScalar(1.003);
      earthGroup.add(cloudsMesh);

      const sunLight = new THREE.DirectionalLight(0xffffff, 2.0);
      sunLight.position.set(-2, 0, 0);
      scene.add(sunLight);

      const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
      scene.add(ambientLight);

      // Handle window resize
      const handleResize = () => {
        if (!mountRef.current || !renderer || !camera) return;

        const width = mountRef.current.clientWidth;
        const height = mountRef.current.clientHeight;

        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
      };

      window.addEventListener("resize", handleResize);

      // Animation
      let animationFrameId;
      const animate = () => {
        animationFrameId = requestAnimationFrame(animate);
        earthMesh.rotation.y += 0.001;
        lightsMesh.rotation.y += 0.001;
        cloudsMesh.rotation.y += 0.001;
        renderer.render(scene, camera);
      };
      animate();

      // Cleanup
      return () => {
        window.removeEventListener("resize", handleResize);
        cancelAnimationFrame(animationFrameId);
        if (mountRefCurrent && renderer.domElement) {
          mountRefCurrent.removeChild(renderer.domElement);
        }
        // Dispose of Three.js resources
        geometry.dispose();
        material.dispose();
        renderer.dispose();
      };
    } catch (error) {
      console.error("An error occurred during Three.js setup:", error);
    }
  }, []); // Empty dependency array since we only want to run this once

  return (
    <div
      ref={mountRef}
      style={{
        width: "100%",
        height: "100%",
        backgroundColor: "#000",
      }}
    />
  );
}
