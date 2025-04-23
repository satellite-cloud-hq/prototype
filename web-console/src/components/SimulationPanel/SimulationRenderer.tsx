import React from "react";
import * as THREE from "three";
import { OrbitControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import Orbit from "./Orbit";
import Earth from "./Earth";
import { satellitesType, simulationType } from "../../utils/types";

export default function SimulationRenderer({
  simulation,
  satellitesData,
}: {
  simulation: simulationType | null;
  satellitesData: satellitesType[];
}) {
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
        <Earth />
        {satellitesData.map((satellite) => {
          return (
            <Orbit
              key={satellite.id}
              simulation={simulation}
              satellites={satellite}
            />
          );
        })}
      </group>
      <directionalLight position={[-2, 0, 0]} intensity={1.0} />
      <ambientLight intensity={0.15} />
    </Canvas>
  );
}
