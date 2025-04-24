import React, { useEffect, useRef, useState } from "react";
import { handleSimulationsOutputGet, handleSimulationsPythonRepl } from "../utils/data";
import { useLoaderData } from "react-router";
import { defaultFiles, useLocalStorage } from "../utils/customHooks";

export default function InterpreterScreen() {
  const { simulation } = useLoaderData();
  const id = simulation?.id;
  const [outputLog, setOutputLog] = useState<string[]>([]);
  const [pythonInput, setPythonInput] = useState<string>("");
  const [files, setFiles] = useLocalStorage("files", defaultFiles);

  const appendOutputLog = (log: string) => {
    setOutputLog((prev) => [...prev, log]);
  };

  // Python コードを実行
  const executePythonCode = async () => {
    try {
      appendOutputLog(`>>> ${pythonInput}\r\n`); // 入力されたコードをログに追加
      // サーバーに Python コードを送信
      const result = await handleSimulationsPythonRepl({
        simulationId: id,
        conditionFileContent: files["config.yaml"].value,
        code: pythonInput
      });
      // サーバーからのレスポンスをログに追加
      if (result) {
        appendOutputLog(`Simulation ID: ${result.id}\r\n`);
      }
      const replResult = await handleSimulationsOutputGet(result.id);
      console.log("REPL Result:", replResult);
      if (replResult) {
        appendOutputLog(`Result\r\n`);
      }
    } catch (error) {
      appendOutputLog(`Error: ${error}\r\n`);
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
