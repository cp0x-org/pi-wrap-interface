import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider } from 'wagmi';
import { Buffer } from 'buffer';

import App from 'App';
import RainbowKitThemeProvider from 'components/RainbowKitThemeProvider';
import { ConfigProvider } from 'contexts/ConfigContext';
import reportWebVitals from 'reportWebVitals';
import * as serviceWorker from 'serviceWorker';
import { config } from './wagmi-config';

import 'assets/scss/style.scss';
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

globalThis.Buffer = Buffer;

const queryClient = new QueryClient();
const container = document.getElementById('root');
const root = createRoot(container!);

root.render(
  <ConfigProvider>
    <WagmiProvider reconnectOnMount={false} config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitThemeProvider>
          <App />
        </RainbowKitThemeProvider>
      </QueryClientProvider>
    </WagmiProvider>
  </ConfigProvider>
);

serviceWorker.unregister();
reportWebVitals();
