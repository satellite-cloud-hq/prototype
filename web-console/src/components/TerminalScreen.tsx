import React, { useEffect, useRef, useState } from "react";
import { Terminal } from "@xterm/xterm";
import { FitAddon } from "xterm-addon-fit";
import "@xterm/xterm/css/xterm.css";
import { useAtom } from "jotai";
import { idAtom, outputLogAtom } from "../utils/atoms";

export default function TerminalScreen() {
  const [id, setId] = useAtom(idAtom);
  const terminalRef = useRef<Terminal>(null);

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
    if (!id || !terminalRef.current) return;

    const newEvtSource = new EventSource(
      `http://localhost:8000/simulations/${id}/output`
    );

    newEvtSource.onopen = () => {
      terminalRef.current?.write(`Connected to server id: ${id}\r\n`);
    };

    newEvtSource.onerror = (error) => {
      terminalRef.current?.write(`Connection error: " ${error}\r\n`);
      newEvtSource.close();
    };

    newEvtSource.addEventListener("stdout", (event) => {
      terminalRef.current?.write(`${event.data} (id: ${id})\r\n`);
    });

    newEvtSource.addEventListener("stderr", (event) => {
      console.error("Stderr:", event.data);
      terminalRef.current?.write(`Error: ${event.data} (id: ${id}\r\n`);
    });

    newEvtSource.addEventListener("done", (event) => {
      terminalRef.current?.write(
        `Simulation finished: ${event.data} (id: ${id})\r\n`
      );
      newEvtSource.close();
    });
    return () => {
      console.log("Closing EventSource" + id);
      newEvtSource.close();
    };
  }, [id, terminalRef.current]);

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
}
