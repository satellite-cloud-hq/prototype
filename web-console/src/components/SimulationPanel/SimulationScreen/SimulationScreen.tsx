import React, { useMemo } from "react";
import { useLoaderData } from "react-router";
import SimulationRenderer from "./SimulationRenderer";
import { useAtomValue } from "jotai";
import {
  currentSimulationAtom,
  getCurrentSimulationTimeAtom,
} from "../../../utils/atoms";

const styles = {
  dataContainer: {
    // position: "absolute",
    color: "white",
    position: "absolute" as const,
    zIndex: 1,
    display: "grid",
    gridTemplateColumns: "160px 100px",
    gap: "4px",
    padding: "12px",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    borderRadius: "4px",
    fontFamily: "monospace",
  },
  label: {
    textAlign: "left" as const,
    paddingRight: "8px",
  },
  value: {
    textAlign: "left" as const,
  },
};

export default function SimulationScreen() {
  const { simulationResult } = useLoaderData();

  const currentSimulationTime = useAtomValue(getCurrentSimulationTimeAtom);
  const currentSimulation = useAtomValue(currentSimulationAtom);

  const formatValue = (value: number) => value?.toFixed(8) ?? "N/A";

  return (
    <div style={{ width: "100%", height: "100%" }}>
      {currentSimulation !== null ? (
        <div style={styles.dataContainer}>
          <div style={styles.label}>Time:</div>
          <div style={styles.value}>{currentSimulationTime}</div>

          <div style={styles.label}>Latitude:</div>
          <div style={styles.value}>
            {formatValue(
              (currentSimulation["spacecraft_latitude[rad]"] * 180) / Math.PI
            )}
          </div>

          <div style={styles.label}>Longitude:</div>
          <div style={styles.value}>
            {formatValue(
              (currentSimulation["spacecraft_longitude[rad]"] * 180) / Math.PI
            )}
          </div>

          <div style={styles.label}>Altitude[m]:</div>
          <div style={styles.value}>
            {formatValue(currentSimulation["spacecraft_altitude[m]"])}
          </div>

          <div style={styles.label}>X Velocity[m/s]:</div>
          <div style={styles.value}>
            {formatValue(currentSimulation["spacecraft_velocity_i_x[m/s]"])}
          </div>

          <div style={styles.label}>Y Velocity[m/s]:</div>
          <div style={styles.value}>
            {formatValue(currentSimulation["spacecraft_velocity_i_y[m/s]"])}
          </div>

          <div style={styles.label}>Z Velocity[m/s]:</div>
          <div style={styles.value}>
            {formatValue(currentSimulation["spacecraft_velocity_i_z[m/s]"])}
          </div>

          <div style={styles.label}>X Acceleration[m/s2]:</div>
          <div style={styles.value}>
            {formatValue(
              currentSimulation["spacecraft_acceleration_i_x[m/s2]"]
            )}
          </div>

          <div style={styles.label}>Y Acceleration[m/s2]:</div>
          <div style={styles.value}>
            {formatValue(
              currentSimulation["spacecraft_acceleration_i_y[m/s2]"]
            )}
          </div>

          <div style={styles.label}>Z Acceleration[m/s2]:</div>
          <div style={styles.value}>
            {formatValue(
              currentSimulation["spacecraft_acceleration_i_z[m/s2]"]
            )}
          </div>
        </div>
      ) : (
        <div style={styles.dataContainer}>No Simulation</div>
      )}
      <SimulationRenderer simulationResult={simulationResult} />
    </div>
  );
}
