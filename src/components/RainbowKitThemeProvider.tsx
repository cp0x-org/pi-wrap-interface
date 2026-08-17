import { ReactNode } from 'react';
import { Locale, RainbowKitProvider } from '@rainbow-me/rainbowkit';
import GlobalStyles from '@mui/material/GlobalStyles';
import useConfig from 'hooks/useConfig';
import { getRainbowKitTheme } from 'themes/rainbowkit-theme';
import { I18n } from 'types/config';

interface RainbowKitThemeProviderProps {
  children: ReactNode;
}

// Maps the app locale onto RainbowKit's own locale so the wallet modal, account
// button and network switcher follow the language picked in the header.
const rainbowKitLocale: Record<I18n, Locale> = {
  en: 'en-US',
  zh: 'zh-CN'
};

const RainbowKitThemeProvider = ({ children }: RainbowKitThemeProviderProps) => {
  const { i18n, mode } = useConfig();

  const customTheme = getRainbowKitTheme(mode);

  return (
    <>
      {/* hide Reown AppKit's built-in snackbar — we use notistack instead */}
      <GlobalStyles styles={{ 'w3m-snackbar': { display: 'none !important' } }} />
      <RainbowKitProvider theme={customTheme} modalSize="compact" locale={rainbowKitLocale[i18n] ?? 'en-US'}>
        {children}
      </RainbowKitProvider>
    </>
  );
};

export default RainbowKitThemeProvider;
