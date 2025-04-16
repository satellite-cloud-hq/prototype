import React, { useEffect, useRef, useState } from "react";
import { Terminal } from "@xterm/xterm";
import "@xterm/xterm/css/xterm.css";

export default function TerminalScreen() {
  const terminalRef = useRef<HTMLDivElement>(null);

  const [terminal, setTerminal] = useState<Terminal | null>(null);

  const disposeTerminal = () => {
    if (terminal) {
      terminal.dispose();
      setTerminal(null);
    }
  };

  const setup = () => {
    disposeTerminal();
    const newTerminal = new Terminal({
      cursorBlink: true,
      fontSize: 14,
    });
    if (terminalRef.current) {
      newTerminal.open(terminalRef.current);
      newTerminal.write("Welcome to the terminal!\r\n$ ");
      setTerminal(newTerminal);
    }
  };

  useEffect(() => {
    try {
      setup();
    } catch (error) {
      console.error("Error setting up terminal:", error);
    }
  }, []);

  return (
    <div
      ref={terminalRef}
      style={{
        backgroundColor: "#000",
        padding: "1%",
        width: "98%",
        height: "98%",
      }}
    />
  );
}
