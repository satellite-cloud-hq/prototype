import { atom } from "jotai";

const idAtom = atom<string | null>(null);
const outputLogAtom = atom<string>("");

export { idAtom, outputLogAtom };
