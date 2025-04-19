import { atom } from "jotai";
import { satellitesType } from "./types";

const idAtom = atom<string | null>(null);
const outputLogAtom = atom<string>("");
const satellitesListAtom = atom<satellitesType[]>([]);

export { idAtom, outputLogAtom, satellitesListAtom };
