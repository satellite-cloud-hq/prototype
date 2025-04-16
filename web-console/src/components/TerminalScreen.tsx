import React, { useEffect, useRef } from "react";
import { Terminal } from "@xterm/xterm";
import "@xterm/xterm/css/xterm.css";

export default function TerminalScreen() {
  const terminalRef = useRef<HTMLDivElement>(null);
  const terminalInstance = useRef<Terminal | null>(null);

  useEffect(() => {
    if (!terminalInstance.current) {
      terminalInstance.current = new Terminal({
        cursorBlink: true,
        fontSize: 14,
      });
    }

    if (terminalRef.current && terminalInstance.current) {
      terminalInstance.current.open(terminalRef.current);
      terminalInstance.current.write("Welcome to the terminal!\r\n$ ");
    }

    return () => {
      if (terminalInstance.current) {
        terminalInstance.current.dispose();
      }
    };
  }, []);

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        padding: "8px",
        backgroundColor: "#000",
        overflow: "hidden",
      }}
    >
      <div
        ref={terminalRef}
        style={{
          width: "100%",
          height: "100%",
        }}
      />
    </div>
  );
}
