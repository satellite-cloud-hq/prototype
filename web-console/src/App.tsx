import { Button, Stack, Typography, TextField } from "@mui/material";
import axios from "axios";
import React, { useState } from "react";

export default function App() {
  const [response, setResponse] = useState("");

  // POST /schedule
  const [scheduleConditionfile, setScheduleConditionFile] = useState<File | null>(null);
  const handleScheduleConditionFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
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

      const res = await axios.post("http://localhost:8000/schedule", formData, { // "0.0.0.0:8900"
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
  const [simulationConditionfile, setSimulationConditionFile] = useState<File | null>(null);
  const [simulationAppfile, setSimulationAppFile] = useState<File | null>(null);
  const handleSimulationConditionFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setSimulationConditionFile(event.target.files[0]);
    }
  };
  const handleSimulationAppFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
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

      const res = await axios.post("http://localhost:8000/simulations", formData, { // "0.0.0.0:8900"
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
  const handleSimulationIdChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    if (value === "") return;
    setSimulationId(parseInt(value));
  };
  const handleSimulationsGet = async () => {
    try {
      const res = await axios.get(`http://localhost:8000/simulations/${simulationId}`);
      setResponse(JSON.stringify(res.data, null, 2));
    } catch (error) {
      console.error(error);
      setResponse("Error occurred while calling the API.");
    }
  };

  // GET /resources/satellites
  const handleReousrcesSatellitesGet = async () => {
    try {
      const res = await axios.get(`http://localhost:8000/resources/satellites`);
      setResponse(JSON.stringify(res.data, null, 2));
    } catch (error) {
      console.error(error);
      setResponse("Error occurred while calling the API.");
    }
  };

  // GET /resources/ground_stations
  const handleReousrcesGroundStationsGet = async () => {
    try {
      const res = await axios.get(`http://localhost:8000/resources/ground_stations`);
      setResponse(JSON.stringify(res.data, null, 2));
    } catch (error) {
      console.error(error);
      setResponse("Error occurred while calling the API.");
    }
  };

  return (
    <Stack direction="column" spacing={2} sx={{ alignItems: "flex-start" }}>
      <Stack direction="row" spacing={2} sx={{ justifyContent: "center" }}>
        <Stack direction="column">
          <Typography>Condition File</Typography>
          <TextField
            type="file"
            onChange={handleScheduleConditionFileChange}
            // inputProps={{ accept: ".txt,.json" }} // 必要に応じてファイル形式を制限
          />
        </Stack>
        <Button variant="contained" color="primary" onClick={handleSchedulePost}>
          POST /schedule
        </Button>
      </Stack>

      <Stack direction="row" spacing={2} sx={{ justifyContent: "center" }}>
        <Stack direction="column">
          <Typography>Condition File</Typography>
          <TextField
            type="file"
            onChange={handleSimulationConditionFileChange}
            // inputProps={{ accept: ".txt,.json" }} // 必要に応じてファイル形式を制限
          />
        </Stack>
        <Stack direction="column">
          <Typography>App File</Typography>
          <TextField
            type="file"
            onChange={handleSimulationAppFileChange}
            // inputProps={{ accept: ".txt,.json" }} // 必要に応じてファイル形式を制限
          />
        </Stack>
        <Button variant="contained" color="primary" onClick={handleSimulationsPost}>
          POST /simulations
        </Button>
      </Stack>

      <Stack direction="row" spacing={2} sx={{ justifyContent: "center" }}>
        <Stack direction="column">
          <Typography>Simulation ID</Typography>
          <TextField
            type="number"
            onChange={handleSimulationIdChange}
            value={simulationId}
          />
        </Stack>
        <Button variant="contained" color="primary" onClick={handleSimulationsGet}>
          GET /simulations/:id
        </Button>
      </Stack>

      <Stack direction="row" spacing={2} sx={{ justifyContent: "center" }}>
        <Button variant="contained" color="primary" onClick={handleReousrcesSatellitesGet}>
          GET /resources/satellites
        </Button>
      </Stack>

      <Stack direction="row" spacing={2} sx={{ justifyContent: "center" }}>
        <Button variant="contained" color="primary" onClick={handleReousrcesGroundStationsGet}>
          GET /resources/ground_stations
        </Button>
      </Stack>

      <Typography variant="h4" component="h1" gutterBottom>
        Response:
      </Typography>
      <Typography variant="body1" component="pre" gutterBottom>
        {response}
      </Typography>
    </Stack>
  );
}
