import '@mui/material/styles';

// NOTE: this augmentation must target '@mui/material/styles', not
// '@mui/material/styles/createPalette'. Since MUI v6 the package `exports` map only
// resolves '@mui/material/<dir>' (-> <dir>/index.d.ts), so the deeper specifier does not
// resolve; TypeScript then treats `declare module` as a *new* ambient module instead of an
// augmentation and the extra palette keys silently never reach MUI's real interfaces.
// '@mui/material/styles' re-exports Palette, PaletteColor, PaletteOptions and TypeText,
// so declaring them here merges with the originals.
declare module '@mui/material/styles' {
  interface PaletteColor {
    100: string;
    200: string;
    300: string;
    400: string;
    500: string;
    600: string;
    700: string;
    800: string;
    900: string;
  }

  export interface TypeText {
    dark: string;
    hint: string;
  }

  interface PaletteOptions {
    orange?: PaletteColorOptions;
    dark?: PaletteColorOptions;
  }

  interface Palette {
    orange: PaletteColor;
    dark: PaletteColor;
  }
}
