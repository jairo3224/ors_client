import { Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import OsasNavbar from './components/OsasNavbar';
import Footer from '../../components/common/Footer';
import './Dashboard.css';

export default function OsasDashboard() {
  const { user } = useAuth();

  return (
    <div className="dashboard">
      <OsasNavbar />
      <main className="main-content">
        <Outlet context={{ user }} />
      </main>
      <Footer />
    </div>
  );
}
