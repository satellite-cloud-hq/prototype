import React, { useCallback, useState, useMemo, useEffect } from "react";
import { Button, Stack } from "@mui/material";
import Globe from "react-globe.gl";
import { handleReousrcesSatellitesGet } from "../utils/data";

export default function Simulation() {
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const containerRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        console.log(
          "Container dimensions:",
          containerRef.current.offsetWidth,
          containerRef.current.offsetHeight
        );
        setDimensions({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight,
        });
      }
    };

    updateDimensions();
    window.addEventListener("resize", updateDimensions);

    return () => window.removeEventListener("resize", updateDimensions);
  }, []);
  return (
    <div
      ref={containerRef}
      style={{ width: "100%", height: "100%", position: "relative" }}
    >
      <Button
        sx={{ position: "absolute", top: 10, left: 10, zIndex: 1 }}
        variant="contained"
        color="primary"
        onClick={() => {
          handleReousrcesSatellitesGet()
            .then((res) => console.log(res.items))
            .catch((error) => {
              alert("Error fetching satellites");
              console.error("Error fetching satellites:", error);
            });
        }}
      >
        Get Satellites
      </Button>
      <Globe
        width={dimensions.width}
        height={dimensions.height}
        globeImageUrl="//cdn.jsdelivr.net/npm/three-globe/example/img/earth-blue-marble.jpg"
        particleLabel="name"
        particleLat="lat"
        particleLng="lng"
        particleAltitude="alt"
        particlesColor={useCallback(() => "palegreen", [])}
      />
    </div>
  );
}
