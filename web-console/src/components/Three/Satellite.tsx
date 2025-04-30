import React, { useRef, useState, useEffect } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import {
  currentSimulationAtom,
  currentSimulationTimeAlphaAtom,
  currentSimulationTimeAtom,
  getCurrentSimulationTimeAtom,
  nextSimulationTimeAtom,
} from "../../utils/atoms";
import { useAtom, useAtomValue } from "jotai";
import { useLoader } from "@react-three/fiber";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

interface SimulationDataPoint {
  _time: string;
  spacecraft_quaternion_i2b_w: number;
  spacecraft_quaternion_i2b_x: number;
  spacecraft_quaternion_i2b_y: number;
  spacecraft_quaternion_i2b_z: number;
}

export default function Satellite({ simulationResult }) {
  const groupRef = useRef<THREE.Group>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [quaternion] = useState(() => new THREE.Quaternion());

  const [currentTime, setCurrentTime] = useAtom(currentSimulationTimeAtom);
  const [nextTime, setNextTime] = useAtom(nextSimulationTimeAtom);
  const [currentSimulation, setCurrentSimulation] = useAtom(
    currentSimulationAtom
  );
  const [alpha, setAlpha] = useAtom(currentSimulationTimeAlphaAtom);

  const satelliteModel = useLoader(GLTFLoader, "/models/satellite.glb");
  useFrame(() => {
    if (
      !groupRef.current ||
      !simulationResult ||
      simulationResult.length === 0
    ) {
      return;
    }

    const nextIndex = (currentIndex + 1) % simulationResult.length;

    // Get quaternion values
    const current = simulationResult[currentIndex];
    setCurrentSimulation(current);
    setCurrentTime(current._time);
    const next = simulationResult[nextIndex];
    setNextTime(next._time);

    // Create quaternions for interpolation
    const currentQuat = new THREE.Quaternion(
      current.spacecraft_quaternion_i2b_x,
      current.spacecraft_quaternion_i2b_y,
      current.spacecraft_quaternion_i2b_z,
      current.spacecraft_quaternion_i2b_w
    );
    const nextQuat = new THREE.Quaternion(
      next.spacecraft_quaternion_i2b_x,
      next.spacecraft_quaternion_i2b_y,
      next.spacecraft_quaternion_i2b_z,
      next.spacecraft_quaternion_i2b_w
    );

    // Interpolate and apply rotation
    quaternion.slerpQuaternions(currentQuat, nextQuat, alpha);
    groupRef.current.quaternion.copy(quaternion);

    // update positions
    // groupRef.current.position.set(-y, z, -x);
    const currentPos = {
      x: -simulationResult[currentIndex]["spacecraft_position_i_y[m]"] / 1e6,
      y: simulationResult[currentIndex]["spacecraft_position_i_z[m]"] / 1e6,
      z: -simulationResult[currentIndex]["spacecraft_position_i_x[m]"] / 1e6,
    };

    const nextPos = {
      x: -simulationResult[nextIndex]["spacecraft_position_i_y[m]"] / 1e6,
      y: simulationResult[nextIndex]["spacecraft_position_i_z[m]"] / 1e6,
      z: -simulationResult[nextIndex]["spacecraft_position_i_x[m]"] / 1e6,
    };

    groupRef.current.position.lerpVectors(
      new THREE.Vector3(currentPos.x, currentPos.y, currentPos.z),
      new THREE.Vector3(nextPos.x, nextPos.y, nextPos.z),
      alpha
    );

    if (alpha >= 1) {
      setCurrentIndex(nextIndex);
    }
    setAlpha((prev) => (prev >= 1 ? 0 : prev + 0.01));
  });

  // Initializing the states when new simulation data is received
  useEffect(() => {
    if (simulationResult && simulationResult.length > 0) {
      setCurrentIndex(0);
      setAlpha(0);

      setCurrentTime(simulationResult[0]._time);
      setNextTime(simulationResult[1]?._time || simulationResult[0]._time);
    }
  }, [simulationResult]);

  return (
    simulationResult !== null &&
    simulationResult.length > 0 && (
      <group ref={groupRef}>
        <primitive object={satelliteModel.scene} scale={0.0001} />
      </group>
    )
  );
}
