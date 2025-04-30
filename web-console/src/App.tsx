import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import React from "react";
import MonacoEditor from "./components/EditorPanel/MonacoEditor";
import TerminalScreen from "./components/TerminalScreen";
import Grafana from "./components/Grafana";
import SimulationPanel from "./components/SimulationPanel/SimulationPanel";
import { Box, Stack } from "@mui/material";
import InterpreterScreen from "./components/InterpreterScreen";

export default function App() {
  return (
    <PanelGroup
      direction="horizontal"
      style={{
        height: "98vh",
        width: "99vw",
        margin: 0,
        padding: 0,
      }}
    >
      <Panel defaultSize={50}>
        <PanelGroup direction="vertical">
          <Panel defaultSize={60}>
            <MonacoEditor />
          </Panel>
          <PanelResizeHandle />
          <Panel defaultSize={40}>
            <Stack direction="row" spacing={0.1} sx={{ height: "100%" }}>
              <TerminalScreen />
              <InterpreterScreen />
              <Box sx={{ width: "0.1px" }} />
            </Stack>
          </Panel>
        </PanelGroup>
      </Panel>
      <PanelResizeHandle />
      <Panel defaultSize={50}>
        <PanelGroup direction="vertical">
          <Panel defaultSize={60}>
            <SimulationPanel />
          </Panel>
          <PanelResizeHandle />
          <Panel defaultSize={60} style={{ width: "100%" }}>
            <Grafana />
          </Panel>
        </PanelGroup>
      </Panel>
    </PanelGroup>
  );
}
