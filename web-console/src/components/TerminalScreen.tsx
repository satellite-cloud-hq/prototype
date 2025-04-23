import React, { useEffect, useRef, useState } from "react";
import { useLoaderData, useSubmit } from "react-router";

export default function TerminalScreen() {
  const submit = useSubmit();
  const { simulation } = useLoaderData();
  const id = simulation?.id;
  const running = simulation?.status === "running";

  const [outputLog, setOutputLog] = useState<string[]>([]);
  const appendOutputLog = (log: string) => {
    setOutputLog((prev) => [...prev, log]);
  };

  useEffect(() => {
    if (!id || !running) {
      setOutputLog([]);
      return;
    }

    const newEvtSource = new EventSource(
      `http://localhost:8000/simulations/${id}/output`
    );

    newEvtSource.onopen = () => {
      setOutputLog([]);
      appendOutputLog(`Connected to server id: ${id}\r\n`);
    };

    newEvtSource.onerror = (error) => {
      appendOutputLog(`Connection error: " ${error}\r\n`);
      newEvtSource.close();
    };

    newEvtSource.addEventListener("stdout", (event) => {
      appendOutputLog(`${event.data} (id: ${id})\r\n`);
      console.log("Stdout:", event.data);
    });

    newEvtSource.addEventListener("stderr", (event) => {
      console.error("Stderr:", event.data);
      appendOutputLog(`Error: ${event.data} (id: ${id}\r\n`);
    });

    newEvtSource.addEventListener("done", (event) => {
      appendOutputLog(`Simulation finished: ${event.data} (id: ${id})\r\n`);

      submit(
        {
          action: "stop",
          simulationId: id,
        },
        {
          method: "post",
          action: "/",
        }
      );
      newEvtSource.close();
    });
    return () => {
      console.log("Closing EventSource" + id);
      newEvtSource.close();
    };
  }, [id]);

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "instant", block: "end" });
    }
  }, [outputLog]);

  return (
    <div
      style={{
        backgroundColor: "black",
        padding: "1%",
        width: "98%",
        height: "98%",
        overflowY: "auto",
        color: "white",
        fontFamily: "monospace",
        fontSize: "14px",
        whiteSpace: "pre",
        wordWrap: "break-word",
        wordBreak: "break-all",
        lineHeight: "1.5",
      }}
    >
      {outputLog.map((log, index) => {
        return <div key={index}>{log}</div>;
      })}
      <div ref={scrollRef} />
    </div>
  );
}
