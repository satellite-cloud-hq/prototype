import React, { useEffect, useRef, useState } from "react";
import { Terminal } from "@xterm/xterm";
import { FitAddon } from "xterm-addon-fit";
import "@xterm/xterm/css/xterm.css";
import { useAtom } from "jotai";
import { idAtom, outputLogAtom } from "../utils/atoms";

export default function TerminalScreen() {
  const terminalRef = useRef<Terminal>(null);

  const [outputLog, setOutputLog] = useAtom(outputLogAtom);

  const disposeTerminal = () => {
    if (terminalRef.current) {
      terminalRef.current.dispose();
      terminalRef.current = null;
    }
  };

  const setup = () => {
    disposeTerminal();
    const newTerminal = new Terminal({
      cursorBlink: true,
      fontSize: 14,
    });
    const fitAddon = new FitAddon();
    newTerminal.loadAddon(fitAddon);
    if (document.getElementById("terminal") !== null) {
      newTerminal.open(document.getElementById("terminal")!);
      fitAddon.fit();
      newTerminal.write("Welcome to the terminal!\r\n$ ");
      terminalRef.current = newTerminal;
    }
  };

  useEffect(() => {
    try {
      setup();
    } catch (error) {
      console.error("Error setting up terminal:", error);
    }
    return () => {
      disposeTerminal();
    };
  }, []);

  useEffect(() => {
    if (terminalRef.current && outputLog) {
      terminalRef.current.write(outputLog);
      setOutputLog("");
    }
  }, [outputLog]);

  return (
    <div
      id="terminal"
      style={{
        backgroundColor: "#000",
        padding: "1%",
        width: "98%",
        height: "98%",
      }}
    />
  );
} //
