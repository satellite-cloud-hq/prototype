import { Box, Grid, Button, Stack, Typography, TextField } from "@mui/material";
import axios from "axios";
import React, { useState } from "react";
import MonacoEditor from "./components/MonacoEditor";
import Simulation from "./components/Simulation";
import TerminalScreen from "./components/TerminalScreen";

const apiClient = axios.create({
  baseURL: "http://localhost:8000/", // Docker Compose のサービス名を使用
});

export default function App() {
  const [response, setResponse] = useState("");

  // POST /schedule
  const [scheduleConditionfile, setScheduleConditionFile] =
    useState<File | null>(null);
  const handleScheduleConditionFileChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (event.target.files && event.target.files.length > 0) {
      setScheduleConditionFile(event.target.files[0]);
    }
  };
  const handleSchedulePost = async () => {
    if (!scheduleConditionfile) {
      setResponse("Please select a file before submitting.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("condition", scheduleConditionfile); // ファイルを追加

      const res = await apiClient.post("/schedule", formData, {
        // "0.0.0.0:8900"
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      setResponse(JSON.stringify(res.data, null, 2));
    } catch (error) {
      console.error(error);
      setResponse("Error occurred while calling the API.");
    }
  };

  // POST /simulations
  const [simulationConditionfile, setSimulationConditionFile] =
    useState<File | null>(null);
  const [simulationAppfile, setSimulationAppFile] = useState<File | null>(null);
  const handleSimulationConditionFileChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (event.target.files && event.target.files.length > 0) {
      setSimulationConditionFile(event.target.files[0]);
    }
  };
  const handleSimulationAppFileChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (event.target.files && event.target.files.length > 0) {
      setSimulationAppFile(event.target.files[0]);
    }
  };
  const handleSimulationsPost = async () => {
    if (!simulationConditionfile || !simulationAppfile) {
      setResponse("Please select a file before submitting.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("condition", simulationConditionfile);
      formData.append("app", simulationAppfile);

      const res = await apiClient.post("/simulations", formData, {
        // "0.0.0.0:8900"
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      setResponse(JSON.stringify(res.data, null, 2));
    } catch (error) {
      console.error(error);
      setResponse("Error occurred while calling the API.");
    }
  };

  // GET /simulations/:id
  const [simulationId, setSimulationId] = useState<number>(1);
  const handleSimulationIdChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = event.target.value;
    if (value === "") return;
    setSimulationId(parseInt(value));
  };
  const handleSimulationsGet = async () => {
    try {
      const res = await apiClient.get(`/simulations/${simulationId}`);
      setResponse(JSON.stringify(res.data, null, 2));
    } catch (error) {
      console.error(error);
      setResponse("Error occurred while calling the API.");
    }
  };

  // GET /resources/satellites
  const handleReousrcesSatellitesGet = async () => {
    try {
      const res = await apiClient.get(`/resources/satellites`);
      setResponse(JSON.stringify(res.data, null, 2));
    } catch (error) {
      console.error(error);
      setResponse("Error occurred while calling the API.");
    }
  };

  // GET /resources/ground_stations
  const handleReousrcesGroundStationsGet = async () => {
    try {
      const res = await apiClient.get(`/resources/ground_stations`);
      setResponse(JSON.stringify(res.data, null, 2));
    } catch (error) {
      console.error(error);
      setResponse("Error occurred while calling the API.");
    }
  };

  return (
    // <Stack direction="column" spacing={2} sx={{ alignItems: "flex-start" }}>
    <Grid
      container
      sx={{
        height: "100vh",
        width: "100vw",
        margin: 0,
        padding: 0,
        overflow: "hidden",
      }}
    >
      <Grid size={6} sx={{ height: "50vh" }}>
        <MonacoEditor />
      </Grid>
      <Grid size={6} sx={{ height: "50vh" }}>
        <Simulation />
      </Grid>
      <Grid size={6} sx={{ height: "50vh" }}>
        <TerminalScreen />
      </Grid>
      <Grid size={6} sx={{ height: "50vh" }}>
        <iframe
          src="http://localhost:3000/public-dashboards/6fefc76edf5c450ba3a4e2d27508ed0f"
          width="100%"
          height="100%"
        ></iframe>
      </Grid>
    </Grid>
  );
}
