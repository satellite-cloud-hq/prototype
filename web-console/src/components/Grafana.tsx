import React, { useEffect, useRef, useState } from "react";
import { Box, Tab, Tabs } from "@mui/material";
import ImagesBoard from "./DashboardPanel/ImagesBoard";
import { handleGetImages } from "../utils/data";
import { useLoaderData } from "react-router";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

export default function Grafana() {
  const [value, setValue] = React.useState(0);
  const { simulation, simulationResult } = useLoaderData();
  const simulationId = simulation.id;

  const startTime =
    simulationResult && simulationResult.length > 0
      ? simulationResult[0]._time
      : null;
  const endTime =
    simulationResult && simulationResult.length > 0
      ? simulationResult[simulationResult.length - 1]._time
      : null;

  const getGrafanaTime = (isoString: string) => {
    return new Date(isoString).getTime();
  };

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  console.log(window.innerHeight);

  const scrollRef = useRef<HTMLDivElement>(null);
  if (scrollRef.current) {
    console.log("scrollRef.current", scrollRef.current.offsetHeight);
  }

  function a11yProps(index: number) {
    return {
      id: `simple-tab-${index}`,
      "aria-controls": `simple-tabpanel-${index}`,
    };
  }

  return (
    <div style={{ height: "100%", width: "100%", backgroundColor: "black" }}>
      {/* タブ部分 */}
      <Box sx={{ borderBottom: 1, borderColor: "divider", bgcolor: "gray" }}>
        <Tabs
          value={value}
          onChange={handleChange}
          textColor="inherit"
          indicatorColor="secondary"
          sx={{
            "& .MuiTab-root": {
              color: "white",
            },
            "& .MuiTabs-indicator": {
              backgroundColor: "white",
            },
          }}
        >
          <Tab label="./dashboard" {...a11yProps(0)} />
          <Tab label="./images" {...a11yProps(1)} />
        </Tabs>
      </Box>

      {value === 0 && (
        <iframe
          src={`http://localhost:3000/d/aek4rk7eb8um8d/new-dashboard?orgId=1&from=${
            startTime ? getGrafanaTime(startTime) : "now-6h"
          }&to=${
            endTime ? getGrafanaTime(endTime) : "now"
          }&timezone=utc&var-id=${simulationId}&kiosk`}
          width="100%"
          height="100%"
        ></iframe>
      )}
      {value === 1 && <ImagesBoard width={"100%"} height={"100%"} />}
    </div>
  );
}
