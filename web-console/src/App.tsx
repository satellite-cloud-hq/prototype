import { Box, Grid, Button, Stack, Typography, TextField } from "@mui/material";
import axios from "axios";
import React, { useState } from "react";
import MonacoEditor from "./components/MonacoEditor";
import Simulation from "./components/Simulation";
import TerminalScreen from "./components/TerminalScreen";
import Grafana from "./components/Grafana";
import SimulationPanel from "./components/SimulationPanel/SimulationPanel";

const apiClient = axios.create({
  baseURL: "http://localhost:8000/", // Docker Compose のサービス名を使用
});

export default function App() {
  return (
    <Grid
      container
      sx={{
        height: "100vh",
        width: "100vw",
        margin: 0,
        padding: 0,
        // overflow: "hidden",
      }}
    >
      <Grid size={6} sx={{ height: "50vh" }}>
        <MonacoEditor />
      </Grid>
      <Grid size={6} sx={{ height: "50vh" }}>
        <SimulationPanel />
      </Grid>
      <Grid size={6} sx={{ height: "50vh" }}>
        <TerminalScreen />
      </Grid>
      <Grid size={6} sx={{ height: "50vh" }}>
        <Grafana />
      </Grid>
    </Grid>
  );
}
