import { atom } from "jotai";
import { atomWithImmer } from "jotai-immer";

const pageStatusAtom = atom<"loading" | "ready">("loading");

const originDirListAtom = atomWithImmer<DirInfo[]>([]);
const filterDirListAtom = atomWithImmer<DirInfo[]>([]);

const imageBasicInfoAtom = atomWithImmer<
  Record<ImageInfo["url"], ImageBasicInfo>
>({});

const previewImageListAtom = atom<string[]>([]);

const currentPreviewImageIndexAtom = atom<number>(0);

export {
  currentPreviewImageIndexAtom,
  filterDirListAtom,
  imageBasicInfoAtom,
  originDirListAtom,
  pageStatusAtom,
  previewImageListAtom,
};
