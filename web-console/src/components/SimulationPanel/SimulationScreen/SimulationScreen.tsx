import React from "react";
import { useLoaderData } from "react-router";
import SimulationRenderer from "./SimulationRenderer";
import { useAtomValue } from "jotai";
import { getCurrentSimulationTimeAtom } from "../../../utils/atoms";

export default function SimulationScreen() {
  const { simulationResult } = useLoaderData();

  const currentSimulationTime = useAtomValue(getCurrentSimulationTimeAtom);
  return (
    <div
      style={{
        position: "relative",
        flex: 1,
      }}
    >
      <div style={{ position: "absolute", color: "white", zIndex: 1 }}>
        {currentSimulationTime}
      </div>
      <SimulationRenderer simulationResult={simulationResult} />
    </div>
  );
}
