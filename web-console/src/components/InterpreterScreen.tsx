import React, { useEffect, useRef, useState } from "react";
import { useLoaderData } from "react-router";

export default function InterpreterScreen() {
  const { simulation } = useLoaderData();
  const id = simulation?.id;
  const [outputLog, setOutputLog] = useState<string[]>([]);
  const [pythonInput, setPythonInput] = useState<string>("");
  const [socket, setSocket] = useState<WebSocket | null>(null);

  const appendOutputLog = (log: string) => {
    setOutputLog((prev) => [...prev, log]);
  };

  // WebSocket 接続を初期化
  useEffect(() => {
    if (!id) return;

    const ws = new WebSocket(`ws://localhost:8000/simulations/${id}/repl`);
    console.log("Websocket endpoint is ",ws)
    setSocket(ws);

    ws.onopen = () => {
      appendOutputLog("WebSocket connection established.\r\n");
    };

    ws.onmessage = (event) => {
      appendOutputLog(event.data);
    };

    ws.onerror = (event) => {
      console.error("WebSocket error:", event);
      appendOutputLog(`WebSocket error\r\n`);
    };

    ws.onclose = () => {
      appendOutputLog("WebSocket connection closed.\r\n");
    };

    return () => {
      ws.close();
    };
  }, [id]);

  // Python コードを送信
  const executePythonCode = () => {
    appendOutputLog(`>>> ${pythonInput}\r\n`);
    if (!socket || socket.readyState !== WebSocket.OPEN) {
      appendOutputLog("WebSocket is not connected.\r\n");
    } else {
      socket.send(pythonInput);
    }
    setPythonInput(""); // 入力フィールドをクリア
  };

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [outputLog]);

  return (
    <div
      style={{
        backgroundColor: "black",
        padding: "1%",
        width: "49%",
        height: "98%",
        overflowY: "auto",
        color: "white",
        fontFamily: "monospace",
        fontSize: "14px",
        whiteSpace: "pre-wrap",
        wordWrap: "break-word",
        wordBreak: "break-all",
        lineHeight: "1.5",
      }}
    >
      {outputLog.map((log, index) => (
        <div key={index}>{log}</div>
      ))}
      <div style={{ display: "flex", alignItems: "center" }}>
        <span style={{ color: "white" }}>{'>>> '}</span>
        <input
          type="text"
          value={pythonInput}
          onChange={(e) => setPythonInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              executePythonCode();
            }
          }}
          style={{
            flex: 1,
            backgroundColor: "black",
            color: "white",
            border: "none",
            outline: "none",
            fontFamily: "monospace",
            fontSize: "14px",
          }}
        />
      </div>
      <div ref={scrollRef} />
    </div>
  );
}
