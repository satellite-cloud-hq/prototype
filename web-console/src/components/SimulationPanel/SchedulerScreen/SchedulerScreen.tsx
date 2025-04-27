import React from "react";
import { Button, ButtonGroup, Stack } from "@mui/material";
import SchedulerRenderer from "./SchedulerRenderer";
import { satellitesType, simulationType } from "../../../utils/types";
import { useActionData, useFetcher, useLoaderData } from "react-router";
import { useAtomValue } from "jotai";
import { schedulerAtom } from "../../../utils/atoms";

export default function SchedulerScreen() {
  const {
    simulation,
    satellites,
  }: { simulation: simulationType | null; satellites: satellitesType[] } =
    useLoaderData();

  const scheduler = useAtomValue(schedulerAtom);

  const fetcher = useFetcher();
  return (
    <div
      style={{
        position: "relative",
        flex: 1,
      }}
    >
      {/* <ButtonGroup sx={{ position: "absolute", top: 10, left: 10, zIndex: 1 }}>
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
      </ButtonGroup> */}
      <SchedulerRenderer simulation={simulation} schedulerData={scheduler} />
    </div>
  );
}
