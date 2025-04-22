import React, { useEffect, useState } from "react";
import { Button, Stack, ButtonGroup, IconButton } from "@mui/material";

import { PlayArrow, Stop } from "@mui/icons-material";

import Editor from "@monaco-editor/react";
import {
  handleSchedulePost,
  handleSimulationsPost,
  handleSimulationsStopPost,
} from "../../utils/data";
import { useAtom } from "jotai";
import {
  simulationAtom,
  outputtLogAtom,
  appendOutputLogAtom,
} from "../../utils/atoms";
import { useLocalStorage } from "../../utils/customHooks";

const defaultFiles = {
  "app.py": {
    name: "app.py",
    language: "python",
    value:
      '"""\n# This is a sample Python script.\n# You can run this script by using the command: python app.py\n"""\n\nprint("Hello, World!")\n',
  },
  "config.yaml": {
    name: "config.yaml",
    language: "yaml",
    value: "",
  },
};
export default function MonacoEditor() {
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

  const [simulation, setSimulation] = useAtom(simulationAtom);
  const [outputLog, setOutputLog] = useAtom(outputtLogAtom);
  const [, appendOutputLog] = useAtom(appendOutputLogAtom);
  const [evtSource, setEvtSource] = useState<EventSource | null>(null);

  useEffect(() => {
    return () => {
      if (evtSource) {
        evtSource.close();
      }
    };
  }, [evtSource]);

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
        {simulation === null || !simulation.running ? (
          <IconButton
            aria-label="play"
            color="primary"
            onClick={async () => {
              try {
                console.log("Uploading app file...");
                console.log("File content:", files["app.py"].value);
                const res = await handleSimulationsPost({
                  conditionFileContent: file["config.yaml"],
                  appFileContent: files["app.py"].value,
                });

                console.log("Response:", res);
                // alert("App file uploaded successfully");
                const { id, status } = res;
                console.log("Simulation ID:", id);
                console.log("Simulation Status:", status);

                if (evtSource) {
                  evtSource.close();
                }
                const newEvtSource = new EventSource(
                  `http://localhost:8000/simulations/${id}/output`
                );

                newEvtSource.onopen = () => {
                  setOutputLog([]);
                  appendOutputLog(`Connected to server id: ${id}\r\n`);
                };

                newEvtSource.onerror = (error) => {
                  appendOutputLog(`Connection error: " ${error}\r\n`);
                  newEvtSource.close();
                };

                newEvtSource.addEventListener("stdout", (event) => {
                  appendOutputLog(`${event.data} (id: ${id})\r\n`);
                  console.log("Stdout:", event.data);
                });

                newEvtSource.addEventListener("stderr", (event) => {
                  console.error("Stderr:", event.data);
                  appendOutputLog(`Error: ${event.data} (id: ${id}\r\n`);
                });

                newEvtSource.addEventListener("done", (event) => {
                  appendOutputLog(
                    `Simulation finished: ${event.data} (id: ${id})\r\n`
                  );
                  newEvtSource.close();
                  setSimulation((prev) => {
                    if (prev) {
                      return { ...prev, running: false };
                    }
                    return prev;
                  });
                });
                setEvtSource(newEvtSource);
                setSimulation({ id: id, running: status === "running" });
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
            onClick={async () => {
              if (!simulation) {
                alert(
                  "No simulation ID found. Please start a simulation first."
                );
                return;
              }
              try {
                const res = await handleSimulationsStopPost(simulation.id);
                console.log("Response:", res);
                alert("Simulation stopped successfully");
              } catch (error) {
                alert("Error stopping simulation."); //TODO show error message
                console.error("Error:", error);
              }
            }}
          >
            <Stop />
          </IconButton>
        )}
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
