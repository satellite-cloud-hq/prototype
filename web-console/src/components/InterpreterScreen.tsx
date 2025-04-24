import React, { useEffect, useRef, useState } from "react";
import { loadPyodide } from "pyodide";

export default function InterpreterScreen() {
  const [outputLog, setOutputLog] = useState<string[]>([]);
  const [pythonInput, setPythonInput] = useState<string>("");
  const [pyodide, setPyodide] = useState<any>(null);

  const appendOutputLog = (log: string) => {
    setOutputLog((prev) => [...prev, log]);
  };

  useEffect(() => {
    const initPyodide = async () => {
      const pyodideInstance = await loadPyodide();

      // 標準出力をキャプチャ
      pyodideInstance.setStdout({
        batched: (output: string) => {
          appendOutputLog(output);
        },
      });

      pyodideInstance.setStderr({
        batched: (error: string) => {
          appendOutputLog(`Error: ${error}`);
        },
      });

      setPyodide(pyodideInstance);
      appendOutputLog("Python interpreter initialized.\r\n");
    };
    initPyodide();
  }, []);

  // Python コードを実行
  const executePythonCode = async () => {
    if (!pyodide) {
      appendOutputLog("Python interpreter is not ready.\r\n");
      return;
    }
    try {
      appendOutputLog(`>>> ${pythonInput}\r\n`);
      const result = pyodide.runPython(pythonInput);
      if (result !== undefined) {
        appendOutputLog(`${result}\r\n`);
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
