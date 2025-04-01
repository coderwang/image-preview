import { atom } from "jotai";
import { atomWithImmer } from "jotai-immer";

const pageStatusAtom = atom<"loading" | "ready">("loading");

const imageBasicInfoAtom = atomWithImmer<
  Record<ImageInfo["url"], ImageBasicInfo>
>({});

const previewImageListAtom = atom<string[]>([]);

const currentPreviewImageIndexAtom = atom<number>(0);

export {
  currentPreviewImageIndexAtom,
  imageBasicInfoAtom,
  pageStatusAtom,
  previewImageListAtom,
};
