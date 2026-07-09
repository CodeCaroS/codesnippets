import { Outlet } from 'react-router-dom';
import { Layout } from '../shared/ui/Layout';

export const App = () => (
  <Layout>
    <Outlet />
  </Layout>
);
