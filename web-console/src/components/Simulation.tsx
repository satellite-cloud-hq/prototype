import React, { useState, useCallback } from "react";
import Globe from "react-globe.gl";

export default function Simulation() {
  return (
    <Globe
      width={500}
      height={500}
      globeImageUrl="//cdn.jsdelivr.net/npm/three-globe/example/img/earth-blue-marble.jpg"
    />
  );
}
