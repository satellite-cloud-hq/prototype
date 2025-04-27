import { Tabs, Tab, Box } from "@mui/material";
import React from "react";
import SchedulerScreen from "./SchedulerScreen/SchedulerScreen";
import SimulationScreen from "./SimulationScreen/SimulationScreen";

export default function SimulationPanel() {
  function a11yProps(index: number) {
    return {
      id: `simple-tab-${index}`,
      "aria-controls": `simple-tabpanel-${index}`,
    };
  }

  const [value, setValue] = React.useState(0);
  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };
  return (
    <div
      style={{
        position: "relative",
        display: "flex",
        flexDirection: "column",

        width: "100%",
        height: "100%",
      }}
    >
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

      {value === 0 && <SchedulerScreen />}
      {value === 1 && <SimulationScreen />}
    </div>
  );
}
