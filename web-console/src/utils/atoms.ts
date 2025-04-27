import { atom } from "jotai";
import { satellitesType } from "./types";

const simulationAtom = atom<{
  id: string;
  running: boolean;
  startDateTime: string;
  endDateTime: string;
} | null>(null);
const outputtLogAtom = atom<string[]>([]);
const clearOutputLogAtom = atom(null, (get, set) => {
  set(outputtLogAtom, []);
});
const appendOutputLogAtom = atom(null, (get, set, newOutput: string) => {
  const currentOutput = get(outputtLogAtom);
  set(outputtLogAtom, [...currentOutput, newOutput]);
});

const schedulerAtom = atom<{
  start_date_time: string;
  end_date_time: string;
  passes: {
    start_date_time: string;
    end_date_time: string;
    satellite: satellitesType;
  }[];
} | null>(null);

const currentSimulationTimeAtom = atom<string | null>(null);
const nextSimulationTimeAtom = atom<string | null>(null);
const currentSimulationTimeAlphaAtom = atom<number>(0);
const getCurrentSimulationTimeAtom = atom((get) => {
  const simulationTime = new Date(get(currentSimulationTimeAtom) || "");
  const nextSimulationTime = new Date(get(nextSimulationTimeAtom) || "");
  const simulationTimeAlpha = get(currentSimulationTimeAlphaAtom);

  if (nextSimulationTime && simulationTime && simulationTimeAlpha) {
    const diff = nextSimulationTime.getTime() - simulationTime.getTime();
    const currentTime = new Date(
      simulationTime.getTime() + diff * simulationTimeAlpha
    );

    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
      timeZone: "UTC",
    }).format(currentTime);
  }
  return null;
});

export {
  schedulerAtom,
  getCurrentSimulationTimeAtom,
  currentSimulationTimeAtom,
  nextSimulationTimeAtom,
  currentSimulationTimeAlphaAtom,
  simulationAtom,
  outputtLogAtom,
  appendOutputLogAtom,
  clearOutputLogAtom,
};

// export {
//   simulationAtom,
//   outputtLogAtom,
//   appendOutputLogAtom,
//   clearOutputLogAtom,
// };
