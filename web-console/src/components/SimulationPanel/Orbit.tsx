import React, { useMemo } from "react";
import * as THREE from "three";
import { orbitType } from "../../utils/types";

export default function Orbit({
  epoch,
  inclination,
  raan,
  eccentricity,
  argument_of_perigee,
  mean_anomaly,
  mean_motion,
}: orbitType) {
  const geometry = useMemo(() => {
    const n = (mean_motion * 2 * Math.PI) / (3600 * 24); // mean motion in rad/s
    const mu = 398600.4418;
    const a = Math.pow(mu / (n * n), 1 / 3); // semi-major axis
    const b = a * Math.sqrt(1 - eccentricity * eccentricity); // semi-minor axis

    const orbit = new THREE.EllipseCurve(
      0,
      0,
      a / 1000,
      b / 1000,
      0,
      Math.PI * 2,
      false,
      0
    );
    const points = orbit.getPoints(100);
    const ellipseGeometry = new THREE.BufferGeometry().setFromPoints(points);
    return ellipseGeometry;
  }, [mean_motion, eccentricity]);

  const rotation = useMemo(() => {
    const initRad = THREE.MathUtils.degToRad(90);
    const raanRad = THREE.MathUtils.degToRad(-raan);
    const inclinationRad = THREE.MathUtils.degToRad(inclination);
    const argPeriRad = THREE.MathUtils.degToRad(-argument_of_perigee);

    const rotMatrix = new THREE.Matrix4();

    rotMatrix.makeRotationX(initRad);
    rotMatrix.multiply(new THREE.Matrix4().makeRotationZ(raanRad));
    rotMatrix.multiply(new THREE.Matrix4().makeRotationY(inclinationRad));
    rotMatrix.multiply(new THREE.Matrix4().makeRotationZ(argPeriRad));

    const euler = new THREE.Euler();
    euler.setFromRotationMatrix(rotMatrix);

    return euler;
  }, [raan, inclination, argument_of_perigee]);

  return (
    <group rotation={[rotation.x, rotation.y, rotation.z]}>
      <line geometry={geometry}>
        <lineBasicMaterial color="white" />
      </line>
    </group>
  );
}
