import { atom } from "jotai";
import { satellitesType } from "./types";

const idAtom = atom<string | null>(null);

export { idAtom };
