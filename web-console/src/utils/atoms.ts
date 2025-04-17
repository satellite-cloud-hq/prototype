import { atom } from "jotai";

const idAtom = atom<string | null>(null);
const outputLogAtom = atom<Map<string, string[]>>(new Map());

export { idAtom, outputLogAtom };
