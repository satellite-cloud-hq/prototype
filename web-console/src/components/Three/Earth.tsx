import React, { useRef } from "react";
import * as THREE from "three";
import { useTexture } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";

export default function Earth({ rotationSpeed = 0.001 }) {
  const earthTexture = useTexture("/textures/00_earthmap1k.jpg");
  const earthCloudsTexture = useTexture("/textures/04_earthcloudmap.jpg");

  const earthMesh = useRef<THREE.Mesh>(null);
  const earthCloudsMesh = useRef<THREE.Mesh>(null);

  useFrame(() => {
    if (!earthMesh.current || !earthCloudsMesh.current) {
      return;
    }
    earthMesh.current.rotation.y += rotationSpeed;
    earthCloudsMesh.current.rotation.y += rotationSpeed;
  });

  return (
    <group>
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
    </group>
  );
}
