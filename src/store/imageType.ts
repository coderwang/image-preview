import { withImmer } from "jotai-immer";
import { atomWithReset } from "jotai/utils";

export const showTypeAtom = withImmer(
  atomWithReset<Record<ImageType, boolean>>({
    avif: true,
    ico: true,
    jpg: true,
    png: true,
    gif: true,
    webp: true,
    svg: true,
  })
);

export const numsAtom = atomWithReset<Record<ImageType, number>>({
  avif: 0,
  ico: 0,
  jpg: 0,
  png: 0,
  gif: 0,
  webp: 0,
  svg: 0,
});
