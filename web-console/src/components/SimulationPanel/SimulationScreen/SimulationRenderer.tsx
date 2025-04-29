import React from "react";
import * as THREE from "three";
import { OrbitControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import Earth from "../../Three/Earth";
import Satellite from "../../Three/Satellite";

export default function SimulationRenderer({ simulationResult }) {
  console.log("Simulation List:", simulationResult);
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
      {/* <Earth rotationSpeed={0} /> */}
      <Satellite simulationResult={simulationResult} />
      <directionalLight position={[2, 0, 0]} intensity={4.0} />
      <ambientLight intensity={0.25} />
    </Canvas>
  );
}
