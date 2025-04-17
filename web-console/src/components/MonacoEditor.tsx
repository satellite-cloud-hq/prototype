import React, { useEffect, useState } from "react";
import { Button, Stack, ButtonGroup, IconButton } from "@mui/material";

import { PlayArrow, Stop } from "@mui/icons-material";

import Editor from "@monaco-editor/react";
import { handleSchedulePost, handleSimulationsPost } from "../utils/data";
import { useAtom } from "jotai";
import { idAtom, outputLogAtom } from "../utils/atoms";

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
  const [files, setFiles] =
    useState<Record<string, { name: string; language: string; value: string }>>(
      defaultFiles
    );

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

  const [evtSource, setEvtSource] = useState<EventSource | null>(null);

  useEffect(() => {
    return () => {
      if (evtSource) {
        console.log("Closing EventSource");
        evtSource.close();
      }
    };
  }, [evtSource]);

  const [, setId] = useAtom(idAtom);
  const [outputLog, setOutputLog] = useAtom(outputLogAtom);

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
        <ButtonGroup>
          <IconButton
            aria-label="play"
            color="primary"
            onClick={async () => {
              try {
                console.log(outputLog);
                const res = await handleSimulationsPost({
                  conditionFileContent: file["config.yaml"],
                  appFileContent: files["app.py"].value,
                });

                console.log("Response:", res);
                alert("App file uploaded successfully");
                const { id, status } = res;
                console.log("Simulation ID:", id);
                console.log("Simulation Status:", status);
                setId(id);

                const newEvtSource = new EventSource(
                  `http://localhost:8000/simulations/${id}/output`
                );
                // Add event listeners for specific event types
                newEvtSource.onopen = () => {
                  setOutputLog(
                    (prev) => `${prev}Connection opened (id: ${id})\n`
                  );
                };

                newEvtSource.onerror = (error) => {
                  console.error("SSE connection error:", error);
                  setOutputLog("Connection error\n");
                  newEvtSource.close();
                };

                newEvtSource.addEventListener("stdout", (event) => {
                  console.log("Stdout:", event.data);
                  setOutputLog((prev) => `${prev}${event.data} (id: ${id})\n`);
                });

                newEvtSource.addEventListener("stderr", (event) => {
                  console.error("Stderr:", event.data);
                  setOutputLog(
                    (prev) => `${prev}Error: ${event.data} (id: ${id})\n`
                  );
                });

                newEvtSource.addEventListener("done", (event) => {
                  console.log("Simulation finished:", event.data);
                  setOutputLog((prev) => `${prev}${event.data} (id: ${id})\n`);
                  newEvtSource.close();
                });
                setEvtSource(newEvtSource);
              } catch (error) {
                alert("Error uploading app file."); //TODO show error message
                console.error("Error:", error);
              }
            }}
          >
            <PlayArrow />
          </IconButton>
          <IconButton aria-label="stop" color="error">
            <Stop />
          </IconButton>
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
        </ButtonGroup>
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
