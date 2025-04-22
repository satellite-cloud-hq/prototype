import { Box, Grid, Button, Stack, Typography, TextField } from "@mui/material";
import axios from "axios";
import React, { useState } from "react";
import MonacoEditor from "./components/EditorPanel/MonacoEditor";
import TerminalScreen from "./components/TerminalScreen";
import Grafana from "./components/Grafana";
import SimulationPanel from "./components/SimulationPanel/SimulationPanel";

export default function App() {
  return (
    <Grid
      container
      sx={{
        height: "96vh",
        width: "99vw",
        margin: 0,
        padding: 0,
      }}
    >
      <Grid size={6} sx={{ height: "50vh" }}>
        <MonacoEditor />
      </Grid>
      <Grid size={6} sx={{ height: "50vh" }}>
        <SimulationPanel />
      </Grid>
      <Grid size={6} sx={{ height: "46vh" }}>
        <TerminalScreen />
      </Grid>
      <Grid size={6} sx={{ height: "46vh" }}>
        <Grafana />
      </Grid>
    </Grid>
  );
}
