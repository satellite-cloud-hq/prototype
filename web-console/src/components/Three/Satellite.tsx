import React, { useRef, useState, useEffect } from "react";
import * as THREE from "three";
import { useTexture } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import {
  currentSimulationTimeAlphaAtom,
  currentSimulationTimeAtom,
  nextSimulationTimeAtom,
} from "../../utils/atoms";
import { useAtom } from "jotai";
import { useLoader } from "@react-three/fiber";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { calculateEarthRotation } from "../../utils/calculateEarthRotation";

export default function Satellite({ simulationResult }) {
  // Load Earth Texture
  const earthTexture = useTexture("/textures/00_earthmap1k.jpg");
  const earthCloudsTexture = useTexture("/textures/04_earthcloudmap.jpg");

  const earthMesh = useRef<THREE.Mesh>(null);
  const earthCloudsMesh = useRef<THREE.Mesh>(null);

  // Load Satellite Model
  const satelliteModel = useLoader(GLTFLoader, "/models/satellite.glb");

  // References to the satellite model and gropu
  const groupRef = useRef<THREE.Group>(null);
  const satelliteRef = useRef<THREE.Group>(null);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [quaternion] = useState(() => new THREE.Quaternion());

  const [currentTime, setCurrentTime] = useAtom(currentSimulationTimeAtom);
  const [nextTime, setNextTime] = useAtom(nextSimulationTimeAtom);
  const [alpha, setAlpha] = useAtom(currentSimulationTimeAlphaAtom);

  useFrame(() => {
    if (
      !satelliteRef.current ||
      !simulationResult ||
      !groupRef.current ||
      simulationResult.length === 0
    ) {
      return;
    }

    const nextIndex = (currentIndex + 1) % simulationResult.length;

    // Get quaternion values
    const current = simulationResult[currentIndex];
    const next = simulationResult[nextIndex];
    setCurrentSimulation(current);
    setCurrentTime(current._time);
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
    satelliteRef.current.quaternion.copy(quaternion);

    // update positions
    const currentPos = {
      x: -simulationResult[currentIndex]["spacecraft_position_ecef_x[m]"] / 1e6,
      y: simulationResult[currentIndex]["spacecraft_position_ecef_z[m]"] / 1e6,
      z: simulationResult[currentIndex]["spacecraft_position_ecef_y[m]"] / 1e6,
    };

    const nextPos = {
      x: -simulationResult[nextIndex]["spacecraft_position_ecef_x[m]"] / 1e6,
      y: simulationResult[nextIndex]["spacecraft_position_ecef_z[m]"] / 1e6,
      z: simulationResult[nextIndex]["spacecraft_position_ecef_y[m]"] / 1e6,
    };

    satelliteRef.current.position.lerpVectors(
      new THREE.Vector3(currentPos.x, currentPos.y, currentPos.z),
      new THREE.Vector3(nextPos.x, nextPos.y, nextPos.z),
      alpha
    );

    // Update Earth and Satellite rotation
    const currentEarthRotation = calculateEarthRotation(current._time);
    const nextEarthRotation = calculateEarthRotation(next._time);
    groupRef.current.rotation.y = THREE.MathUtils.lerp(
      currentEarthRotation,
      nextEarthRotation,
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
    <group rotation={[0, 0, (23.4 * Math.PI) / 180]}>
      <group ref={groupRef}>
        <mesh ref={earthMesh}>
          <icosahedronGeometry args={[6.378, 12]} />
          <meshStandardMaterial map={earthTexture} />
        </mesh>
        <mesh scale={1.003} ref={earthCloudsMesh}>
          <icosahedronGeometry args={[6.378, 12]} />
          <meshStandardMaterial
            map={earthCloudsTexture}
            transparent={true}
            opacity={0.5}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
        {simulationResult !== null && simulationResult.length > 0 && (
          <group ref={satelliteRef}>
            <primitive object={satelliteModel.scene} scale={0.0001} />
          </group>
        )}
      </group>
    </group>
  );
}
