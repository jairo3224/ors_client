import { Outlet, useOutletContext } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import OsasNavbar from './components/OsasNavbar';
import Footer from '../../components/common/Footer';
import './components/Dashboard.css';

export function useOsasContext() {
  return useOutletContext();
}

export default function Dashboard() {
  const { user } = useAuth();

  const outletContext = {
    user,
  };

  return (
    <div className="dashboard">
      <OsasNavbar />

      <main className="main-content">
        <Outlet context={outletContext} />
      </main>

      <Footer />
    </div>
  );
}
