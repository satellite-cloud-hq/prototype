import React from "react";
import * as THREE from "three";
import { OrbitControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import Orbit from "../../Three/Orbit";
import Earth from "../../Three/Earth";
import { satellitesType, simulationType } from "../../../utils/types";

export default function SchedulerRenderer({
  schedulerData,
}: {
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
        <Earth rotationSpeed={0.0} />
        {schedulerData !== null &&
          schedulerData.passes.map((schedule) => {
            return <Orbit key={schedule.satellite.id} schedule={schedule} />;
          })}
      </group>
      <directionalLight position={[2, 0, 0]} intensity={8.0} />
      <ambientLight intensity={0.15} />
    </Canvas>
  );
}
