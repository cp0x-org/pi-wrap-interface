import { RouterProvider } from 'react-router-dom';
import { SnackbarProvider } from 'notistack';

import ChainSwitchNotifier from 'components/ChainSwitchNotifier';
import NavigationScroll from 'layout/NavigationScroll';
import router from 'routes';
import ThemeCustomization from 'themes';

export default function App() {
  return (
    <ThemeCustomization>
      <NavigationScroll>
        <SnackbarProvider maxSnack={3} preventDuplicate>
          <ChainSwitchNotifier />
          <RouterProvider router={router} />
        </SnackbarProvider>
      </NavigationScroll>
    </ThemeCustomization>
  );
}
