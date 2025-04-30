import React from "react";
import * as THREE from "three";
import { OrbitControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import Earth from "../../Three/Earth";
import Satellite from "../../Three/Satellite";

export default function SimulationRenderer({ simulationResult }) {
  return (
    <Canvas
      gl={{
        antialias: true,
        toneMapping: THREE.ACESFilmicToneMapping,
      }}
      camera={{
        fov: 75,
        zoom: 1,
        near: 0.1,
        far: 1000,
        position: [10, 0, 5],
      }}
      style={{
        backgroundColor: "black",
      }}
    >
      <OrbitControls />
      <group rotation={[0, 0, (23.4 * Math.PI) / 180]}>
        <Earth rotationSpeed={0} />
        <Satellite simulationResult={simulationResult} />
      </group>
      <directionalLight position={[-2, 0, 0]} intensity={2.0} />
      <ambientLight intensity={0.55} />
    </Canvas>
  );
}
