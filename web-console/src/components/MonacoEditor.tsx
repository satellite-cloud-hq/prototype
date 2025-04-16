import React, { useState } from "react";
import { Button, Stack, ButtonGroup, IconButton } from "@mui/material";

import { PlayArrow, Stop } from "@mui/icons-material";

import Editor from "@monaco-editor/react";
import { handleSchedulePost, handleSimulationsPost } from "../utils/data";

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

  return (
    <>
      <Stack direction="row" spacing={2} mb={2}>
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
            onClick={() => {
              handleSimulationsPost({
                conditionFileContent: file["config.yaml"],
                appFileContent: files["app.py"].value,
              })
                .then((res) => {
                  console.log("Response:", res);
                })
                .catch((error) => {
                  alert("Error uploading app file."); //TODO show error message
                  console.error("Error:", error);
                });
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
      <Editor
        width="50%"
        height="50vh"
        defaultLanguage={file.language}
        theme="vs-dark"
        path={file.name}
        defaultValue={file.value}
        onChange={handleEditorChange}
      />
    </>
  );
}
