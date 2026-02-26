export type Colors = {
  bg: string;
  orange: string;
  orangeBg: string;
  darkOrange: string;
  lightOrange: string;
  lightBlue: string;
  darkBlue: string;
  red: string;
  white: string;
  black: string;
  medium: string;
  light: string;
  dark: string;
  danger: string;
  green: string;
  // Overlays
  backdropBg: string;
  overlayBtn: string;
  overlayMid: string;
  overlayLight: string;
  // Surfaces & borders
  surfaceFaint: string;
  divider: string;
  chipBorder: string;
  chipSurface: string;
  // Input
  placeholder: string;
  // Semantic
  flagBg: string;
};

export type ColorKey = keyof Colors;

export const colors: Colors = {
  bg: '#272c36',
  orange: '#eb9605',
  orangeBg: '#976000',
  darkOrange: '#be550f',
  lightOrange: '#f3bc77',
  lightBlue: '#8fbcbb',
  darkBlue: '#055358',
  red: '#B64003',
  white: '#fff',
  black: '#171a20',
  medium: '#6e6969',
  light: '#f8f4f4',
  dark: '#252224',
  danger: '#ff5252',
  green: '#4BB543',
  // Overlays
  backdropBg: '#000000c7',
  overlayBtn: '#00000080',
  overlayMid: '#0000007b',
  overlayLight: '#00000060',
  // Surfaces & borders
  surfaceFaint: '#ffffff12',
  divider: '#ffffff1a',
  chipBorder: '#ffffff26',
  chipSurface: '#ffffff0d',
  // Input
  placeholder: '#ffffff66',
  // Semantic
  flagBg: '#3d1010',
};
