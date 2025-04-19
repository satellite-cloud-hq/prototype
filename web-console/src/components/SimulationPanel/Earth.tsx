import React, { useRef } from "react";
import * as THREE from "three";
import { useTexture } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";

export default function Earth() {
  const earthTexture = useTexture("/textures/00_earthmap1k.jpg");
  const earthLightsTexture = useTexture("/textures/03_earthlights1k.jpg");
  const earthCloudsTexture = useTexture("/textures/04_earthcloudmap.jpg");
  const earthCloudsTransTexture = useTexture(
    "/textures/05_earthcloudmaptrans.jpg"
  );

  const earthMesh = useRef<THREE.Mesh>(null);
  const earthLightsMesh = useRef<THREE.Mesh>(null);
  const earthCloudsMesh = useRef<THREE.Mesh>(null);

  useFrame(() => {
    if (
      !earthMesh.current ||
      !earthLightsMesh.current ||
      !earthCloudsMesh.current
    ) {
      return;
    }
    earthMesh.current.rotation.y += 0.001;
    earthLightsMesh.current.rotation.y += 0.001;
    earthCloudsMesh.current.rotation.y += 0.001;
  });

  return (
    <group>
      <mesh ref={earthMesh}>
        <icosahedronGeometry args={[6.378, 12]} />
        <meshStandardMaterial map={earthTexture} />
      </mesh>
      <mesh ref={earthLightsMesh}>
        <icosahedronGeometry args={[6.378, 12]} />
        <meshBasicMaterial
          map={earthLightsTexture}
          opacity={0.5}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
      <mesh scale={1.003} ref={earthCloudsMesh}>
        <icosahedronGeometry args={[6.378, 12]} />
        <meshStandardMaterial
          map={earthCloudsTexture}
          transparent={true}
          opacity={0.5}
          blending={THREE.AdditiveBlending}
          alphaMap={earthCloudsTransTexture}
        />
      </mesh>
    </group>
  );
}
