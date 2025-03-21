import { atom } from "jotai";
import { atomWithImmer } from "jotai-immer";

export const showTypeAtom = atomWithImmer<Record<ImageType, boolean>>({
  avif: true,
  ico: true,
  jpg: true,
  png: true,
  gif: true,
  webp: true,
  svg: true,
});

export const numsAtom = atom<Record<ImageType, number>>({
  avif: 0,
  ico: 0,
  jpg: 0,
  png: 0,
  gif: 0,
  webp: 0,
  svg: 0,
});
