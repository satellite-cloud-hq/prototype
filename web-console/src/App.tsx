import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import React from "react";
import MonacoEditor from "./components/EditorPanel/MonacoEditor";
import TerminalScreen from "./components/TerminalScreen";
import Grafana from "./components/Grafana";
import SimulationPanel from "./components/SimulationPanel/SimulationPanel";

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
            <TerminalScreen />
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
          <Panel defaultSize={60}>
            <Grafana  />
          </Panel>
        </PanelGroup>
      </Panel>
    </PanelGroup>
  );
}
