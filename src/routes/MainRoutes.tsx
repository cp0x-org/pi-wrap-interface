import MainLayout from 'layout/MainLayout';
import WrapPage from 'views/wrap/WrapPage';

// ==============================|| MAIN ROUTING ||============================== //

const MainRoutes = {
  path: '/',
  element: <MainLayout />,
  children: [
    {
      index: true,
      element: <WrapPage />
    }
  ]
};

export default MainRoutes;
