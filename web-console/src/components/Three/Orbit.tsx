import React, { useMemo } from "react";
import * as THREE from "three";
import { satellitesType, simulationType } from "../../utils/types";

export default function Orbit({
  simulation,
  satellites,
}: {
  simulation: simulationType | null;
  satellites: satellitesType;
}) {
  const { orbit } = satellites;
  const {
    mean_motion,
    eccentricity,
    epoch,
    mean_anomaly,
    raan,
    inclination,
    argument_of_perigee,
  } = orbit;

  const calculateSimulationAngle = (
    epoch: string,
    start: string,
    end: string,
    n: number,
    mean_anomaly: number
  ) => {
    const epochDate = new Date(epoch);

    const epochTime = epochDate.getTime();
    const startTime = new Date(start).getTime();
    const endTime = new Date(end).getTime();

    const timeDiff = (epochTime - startTime) / 1000; // in seconds
    const totalTime = (endTime - startTime) / 1000; // in seconds

    const startAngle = n * timeDiff + mean_anomaly;
    const endAngle = n * totalTime + startAngle;
    console.log(`Total time: ${totalTime}`);
    return [startAngle, endAngle];
  };

  const [geometry, highlightedGeometry] = useMemo(() => {
    const n = (mean_motion * 2 * Math.PI) / (3600 * 24); // mean motion in rad/s
    console.log(`mean motion: ${n}`);
    const mu = 398600.4418;
    const a = Math.pow(mu / (n * n), 1 / 3); // semi-major axis
    const b = a * Math.sqrt(1 - eccentricity * eccentricity); // semi-minor axis

    console.log("simulation: " + simulation);
    const [startAngle, endAngle] = simulation
      ? calculateSimulationAngle(
          epoch,
          simulation.start_date_time,
          simulation.end_date_time,
          n,
          mean_anomaly
        )
      : [Math.PI * 2, 0];

    console.log(`Start Angle: ${startAngle}, End Angle: ${endAngle}`);

    const orbitHighlighted = new THREE.EllipseCurve(
      0,
      0,
      a / 1000,
      b / 1000,
      startAngle,
      simulation ? endAngle : startAngle,
      false,
      0
    );
    const orbit = new THREE.EllipseCurve(
      0,
      0,
      a / 1000,
      b / 1000,
      endAngle,
      startAngle,
      false,
      0
    );
    const points = orbit.getPoints(100);
    const ellipseGeometry = new THREE.BufferGeometry().setFromPoints(points);
    const highlightedPoints = orbitHighlighted.getPoints(10000);
    const highlightedEllipseGeometry = new THREE.BufferGeometry().setFromPoints(
      highlightedPoints
    );
    return [ellipseGeometry, highlightedEllipseGeometry];
  }, [mean_motion, eccentricity, simulation]);

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
        <lineBasicMaterial color="grey" />
      </line>
      <line geometry={highlightedGeometry}>
        <lineBasicMaterial color="red" />
      </line>
    </group>
  );
}
