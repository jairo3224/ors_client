import { Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import ChaplainNavbar from './Navbar';
import Footer from '../../components/common/Footer';
import '../guidance/Dashboard.css';

export default function ChaplainDashboard() {
  const { user } = useAuth();

  return (
    <div className="dashboard">
      <ChaplainNavbar />
      <main className="main-content">
        <Outlet context={{ user }} />
      </main>
      <Footer />
    </div>
  );
}
