import { atom } from "jotai";

const simulationAtom = atom<{
  id: string;
  running: boolean;
  start: string;
  end: string;
} | null>(null);
const outputtLogAtom = atom<string[]>([]);
const clearOutputLogAtom = atom(null, (get, set) => {
  set(outputtLogAtom, []);
});
const appendOutputLogAtom = atom(null, (get, set, newOutput: string) => {
  const currentOutput = get(outputtLogAtom);
  set(outputtLogAtom, [...currentOutput, newOutput]);
});

export {
  simulationAtom,
  outputtLogAtom,
  appendOutputLogAtom,
  clearOutputLogAtom,
};
