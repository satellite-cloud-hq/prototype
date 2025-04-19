// This file is deprecated and will be removed in the future.
import React, {
  useRef,
  useCallback,
  useState,
  useMemo,
  useEffect,
} from "react";
import { Button, ButtonGroup, Stack } from "@mui/material";
import Globe from "react-globe.gl";
import {
  handleReousrcesGroundStationsGet,
  handleReousrcesSatellitesGet,
} from "../utils/data";

import * as THREE from "three";

export default function Simulation() {
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const containerRef = React.useRef<HTMLDivElement>(null);
  const globeEl = useRef<any>(null);

  const [gsData, setGsData] = useState<
    { lat: number; lng: number; alt: number; name: string; id: string }[]
  >([]);

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
      <ButtonGroup sx={{ position: "absolute", top: 10, left: 10, zIndex: 1 }}>
        <Button
          onClick={() => {
            handleReousrcesSatellitesGet()
              .then((res) => {
                console.log(res.items);
                alert("Satellites fetched successfully");
              })
              .catch((error) => {
                alert("Error fetching satellites");
                console.error("Error fetching satellites:", error);
              });
          }}
        >
          Get Satellites
        </Button>
        <Button
          onClick={() => {
            handleReousrcesGroundStationsGet()
              .then((res) => {
                console.log(res.items);
                const gsList = res.items.map((gs) => ({
                  lat: gs.latitude,
                  lng: gs.longitude,
                  alt: 0,
                  name: gs.name,
                  id: gs.id,
                }));
                setGsData(gsList);
                console.log(gsList);
                alert("Ground stations fetched successfully");
              })
              .catch((error) => {
                alert("Error fetching ground stations");
                console.error("Error fetching ground stations:", error);
              });
          }}
        >
          Get Ground Stations
        </Button>
      </ButtonGroup>
      <Globe
        ref={globeEl}
        width={dimensions.width}
        height={dimensions.height}
        globeImageUrl="//cdn.jsdelivr.net/npm/three-globe/example/img/earth-blue-marble.jpg"
        labelsData={gsData}
        labelText={"name"}
        labelSize={2}
        labelDotRadius={0.5}
        customLayerData={[
          {
            lat: 80,
            lng: 80,
            alt: -0,
            color: "red",
            radius: 101,
          },
        ]}
        customThreeObject={(d) => {
          const plane = new THREE.Mesh(
            new THREE.PlaneGeometry(300, 300, 1, 1),
            new THREE.MeshLambertMaterial({ color: "red" })
          );
          plane.rotation.x = Math.PI / 4;
          return plane;
        }}
        customThreeObjectUpdate={(obj, objData) => {
          const d = objData as {
            lat: number;
            lng: number;
            alt: number;
            color: string;
            radius: number;
          };
          Object.assign(
            obj.position,
            globeEl.current.getCoords(d.lat, d.lng, d.alt)
          );
        }}
      />
    </div>
  );
}
