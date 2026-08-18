import '@mui/material/styles';
// `themes/shadows` only has a default export (the customShadows factory), so the old
// `import { customShadows }` resolved to nothing — masked by `skipLibCheck: true`.
// CustomShadowProps is the actual shape that factory returns.
import { CustomShadowProps } from 'types/default-theme';

declare module '@mui/material/styles' {
  export interface ThemeOptions {
    customShadows?: CustomShadowProps;
    customization?: TypographyOptions | ((palette: Palette) => TypographyOptions);
    darkTextSecondary?: string;
    textDark?: string;
    darkTextPrimary?: string;
    grey500?: string;
  }
  interface Theme {
    customShadows: CustomShadowProps;
    customization: Typography;
    darkTextSecondary: string;
    textDark: string;
    grey500: string;
    darkTextPrimary: string;
  }
}
