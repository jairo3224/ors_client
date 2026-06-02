import { Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import GuidanceNavbar from './Navbar';
import Footer from '../../components/common/Footer';
import './Dashboard.css';

export default function GuidanceDashboard() {
  const { user } = useAuth();

  return (
    <div className="dashboard">
      <GuidanceNavbar />
      <main className="main-content">
        <Outlet context={{ user }} />
      </main>
      <Footer />
    </div>
  );
}
