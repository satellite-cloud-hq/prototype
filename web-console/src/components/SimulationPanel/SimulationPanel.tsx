import React from "react";
import { Button, ButtonGroup, Stack } from "@mui/material";
import SimulationRenderer from "./SimulationRenderer";
import { satellitesType, simulationType } from "../../utils/types";
import { useFetcher, useLoaderData } from "react-router";

export default function SimulationPanel() {
  const {
    simulation,
    satellites,
  }: { simulation: simulationType | null; satellites: satellitesType[] } =
    useLoaderData();

  const fetcher = useFetcher();
  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
      }}
    >
      <ButtonGroup sx={{ position: "absolute", top: 10, left: 10, zIndex: 1 }}>
        <Button
          onClick={() => {
            if (simulation?.id) {
              fetcher.load(`/${simulation.id}`);
            }
          }}
        >
          Get Satellites
        </Button>
        <Button
          onClick={() => {
            if (simulation?.id) {
              fetcher.load(`/${simulation.id}`);
            }
          }}
        >
          Get Ground Stations
        </Button>
      </ButtonGroup>
      <SimulationRenderer simulation={simulation} satellitesData={satellites} />
    </div>
  );
}
