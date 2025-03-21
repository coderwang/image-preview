import { GetProp } from "antd/es/_util/type";
import { ColorPickerProps } from "antd/es/color-picker";
import { atom } from "jotai";

type Color = Extract<
  GetProp<ColorPickerProps, "value">,
  string | { cleared: any }
>;

export const backgroundColorAtom = atom<Color>("#fff");
