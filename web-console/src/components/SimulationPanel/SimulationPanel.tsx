import React, { useCallback, useState, useMemo, useEffect } from "react";
import { Button, ButtonGroup, Stack } from "@mui/material";
import {
  handleReousrcesGroundStationsGet,
  handleReousrcesSatellitesGet,
} from "../../utils/data";
import SimulationRenderer from "./SimulationRenderer";
import { satellitesType } from "../../utils/types";

export default function SimulationPanel() {
  const [satellitesList, setSatellitesList] = useState<satellitesType[]>([]);
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
            handleReousrcesSatellitesGet()
              .then((res) => {
                console.log(res.items);
                setSatellitesList(res.items);
                alert("Satellites fetched successfully");
              })
              .catch((error) => {
                alert("Error fetching satellites");
                console.error("Error fetching satellites:", error);
              });
          }}
        >
          Get Satellites
        </Button>
        <Button
          onClick={() => {
            handleReousrcesGroundStationsGet()
              .then((res) => {
                console.log(res.items);
                alert("Ground stations fetched successfully");
              })
              .catch((error) => {
                alert("Error fetching ground stations");
                console.error("Error fetching ground stations:", error);
              });
          }}
        >
          Get Ground Stations
        </Button>
      </ButtonGroup>
      <SimulationRenderer satellitesData={satellitesList} />
    </div>
  );
}
