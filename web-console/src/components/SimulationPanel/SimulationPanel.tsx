import React from "react";
import { useLoaderData } from "react-router";
import SimulationRenderer from "./SimulationRenderer";
import { useAtomValue } from "jotai";
import { getCurrentSimulationTimeAtom } from "../../utils/atoms";

export default function SimulationPanel() {
  const { simulationResult } = useLoaderData();

  const currentSimulationTime = useAtomValue(getCurrentSimulationTimeAtom);
  console.log("Simulation List:", simulationResult);
  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
      }}
    >
      <div style={{ position: "absolute", color: "white", zIndex: 1 }}>
        {currentSimulationTime}
      </div>
      <SimulationRenderer simulationResult={simulationResult} />
    </div>
  );
}
