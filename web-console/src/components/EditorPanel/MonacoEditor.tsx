import React, { useState } from "react";
import {
  Button,
  Stack,
  ButtonGroup,
  IconButton,
  InputLabel,
  FormControl,
  MenuItem,
  Select,
} from "@mui/material";

import { PlayArrow, Stop } from "@mui/icons-material";

import Editor from "@monaco-editor/react";
import { handleSchedulePost } from "../../utils/data";
import { defaultFiles, useLocalStorage } from "../../utils/customHooks";
import { useLoaderData, useSearchParams, useSubmit } from "react-router";

export default function MonacoEditor() {
  const submit = useSubmit();
  const { simulation, simulationsList } = useLoaderData();
  const simulationId = simulation?.id;
  const running = simulation?.status === "running";
  const [fileName, setFileName] = useState("app.py");
  const [files, setFiles] = useLocalStorage("files", defaultFiles);

  const file = files[fileName];

  const handleEditorChange = (value: string | undefined) => {
    setFiles({
      ...files,
      [fileName]: {
        ...files[fileName],
        value: value || "",
      },
    });
  };

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        position: "relative",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Stack
        direction="row"
        spacing={2}
        mb={2}
        sx={{ justifyContent: "flex-start" }}
      >
        <ButtonGroup
          variant="contained"
          aria-label="outlined primary button group"
        >
          <Button
            disabled={fileName === "app.py"}
            onClick={() => setFileName("app.py")}
          >
            app.py
          </Button>
          <Button
            disabled={fileName === "config.yaml"}
            onClick={() => setFileName("config.yaml")}
          >
            config.yaml
          </Button>
        </ButtonGroup>
        {simulation === null || !running ? (
          <IconButton
            aria-label="play"
            color="primary"
            onClick={async () => {
              try {
                submit(
                  {
                    action: "run",
                    conditionFileContent: files["config.yaml"].value,
                    appFileContent: files["app.py"].value,
                  },
                  {
                    method: "post",
                    action: "/",
                  }
                );
              } catch (error) {
                alert("Error uploading app file."); //TODO show error message
                console.error("Error:", error);
              }
            }}
          >
            <PlayArrow />
          </IconButton>
        ) : (
          <IconButton
            aria-label="stop"
            color="error"
            onClick={() => {
              if (!simulationId) {
                alert(
                  "No simulation ID found. Please start a simulation first."
                );
                return;
              }
              try {
                submit(
                  {
                    action: "stop",
                    simulationId: simulationId,
                  },
                  {
                    method: "post",
                    action: "/",
                  }
                );
              } catch (error) {
                alert("Error stopping simulation."); //TODO show error message
                console.error("Error:", error);
              }
            }}
          >
            <Stop />
          </IconButton>
        )}
        <FormControl>
          <InputLabel id="demo-simple-select-label">id</InputLabel>
          <Select
            value={simulationId || ""}
            label="id"
            onChange={async (event) => {
              submit(
                {
                  action: "switch",
                  simulationId: event.target.value,
                },
                {
                  method: "post",
                  action: "/",
                }
              );
            }}
          >
            {simulationsList.map((simulation) => (
              <MenuItem key={simulation.id} value={simulation.id}>
                {simulation.id}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Button
          variant="contained"
          color="inherit"
          onClick={() => {
            handleSchedulePost(files["config.yaml"].value)
              .then((res) => {
                console.log("Response:", res);
                alert("Config file uploaded successfully");
              })
              .catch((error) => {
                alert("Error uploading config file."); //TODO show error message
                console.error("Error:", error);
              });
          }}
        >
          Upload Config File
        </Button>
      </Stack>
      <div style={{ flex: 1, minHeight: 0 }}>
        <Editor
          defaultLanguage={file.language}
          theme="vs-dark"
          path={file.name}
          defaultValue={file.value}
          onChange={handleEditorChange}
          options={{
            automaticLayout: true,
          }}
        />
      </div>
    </div>
  );
}
