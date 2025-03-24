import { atom } from "jotai";

const previewImageListAtom = atom<string[]>([]);

const currentPreviewImageIndexAtom = atom<number>(0);

export { currentPreviewImageIndexAtom, previewImageListAtom };
