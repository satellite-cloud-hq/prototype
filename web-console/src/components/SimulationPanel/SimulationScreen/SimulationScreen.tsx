import React, { useMemo } from "react";
import { useLoaderData } from "react-router";
import SimulationRenderer from "./SimulationRenderer";
import { useAtomValue } from "jotai";
import {
  currentSimulationAtom,
  getCurrentSimulationTimeAtom,
} from "../../../utils/atoms";
import SimulationStats from "./SimulationStats";

export default function SimulationScreen() {
  const { simulationResult } = useLoaderData();

  const currentSimulationTime = useAtomValue(getCurrentSimulationTimeAtom);
  const currentSimulation = useAtomValue(currentSimulationAtom);

  const formatValue = (value: number) => value?.toFixed(8) ?? "N/A";

  return (
    <div style={{ width: "100%", height: "100%" }}>
      {currentSimulation !== null ? (
        <SimulationStats />
      ) : (
        <div
          style={{
            position: "absolute",
            zIndex: 1,
            color: "white",
            margin: "12px",
            fontFamily: "monospace",
          }}
        >
          No Simulation
        </div>
      )}
      <SimulationRenderer simulationResult={simulationResult} />
    </div>
  );
}
