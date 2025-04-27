import React from "react";
import * as THREE from "three";
import { OrbitControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import Orbit from "../../Three/Orbit";
import Earth from "../../Three/Earth";
import { satellitesType, simulationType } from "../../../utils/types";

export default function SchedulerRenderer({
  simulation,
  schedulerData,
}: {
  simulation: simulationType | null;
  schedulerData: {
    start_date_time: string;
    end_date_time: string;
    passes: {
      start_date_time: string;
      end_date_time: string;
      satellite: satellitesType;
    }[];
  } | null;
}) {
  const satellitesData =
    schedulerData !== null
      ? schedulerData.passes.map((pass) => pass.satellite)
      : [];
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
