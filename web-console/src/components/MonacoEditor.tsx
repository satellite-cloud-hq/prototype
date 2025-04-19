import React, { useEffect, useState } from "react";
import { Button, Stack, ButtonGroup, IconButton } from "@mui/material";

import { PlayArrow, Stop } from "@mui/icons-material";

import Editor from "@monaco-editor/react";
import { handleSchedulePost, handleSimulationsPost } from "../utils/data";
import { useAtom } from "jotai";
import { idAtom } from "../utils/atoms";

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

  const [, setId] = useAtom(idAtom);

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
