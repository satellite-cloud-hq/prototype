import React from "react";
import { Button, ButtonGroup, Stack } from "@mui/material";
import SchedulerRenderer from "./SchedulerRenderer";
import { satellitesType, simulationType } from "../../../utils/types";
import { useActionData, useFetcher, useLoaderData } from "react-router";
import { useAtomValue } from "jotai";
import { schedulerAtom } from "../../../utils/atoms";

export default function SchedulerScreen() {
  const scheduler = useAtomValue(schedulerAtom);

  const fetcher = useFetcher();
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
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
      <SchedulerRenderer schedulerData={scheduler} />
    </div>
  );
}
