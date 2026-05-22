import { ReactNode } from 'react';
import { RainbowKitProvider } from '@rainbow-me/rainbowkit';
import GlobalStyles from '@mui/material/GlobalStyles';
import useConfig from 'hooks/useConfig';
import { getRainbowKitTheme } from 'themes/rainbowkit-theme';

interface RainbowKitThemeProviderProps {
  children: ReactNode;
}

const RainbowKitThemeProvider = ({ children }: RainbowKitThemeProviderProps) => {
  const { mode } = useConfig();

  const customTheme = getRainbowKitTheme(mode);

  return (
    <>
      {/* hide Reown AppKit's built-in snackbar — we use notistack instead */}
      <GlobalStyles styles={{ 'w3m-snackbar': { display: 'none !important' } }} />
      <RainbowKitProvider
        theme={customTheme}
        modalSize="compact"
      >
        {children}
      </RainbowKitProvider>
    </>
  );
};

export default RainbowKitThemeProvider;
