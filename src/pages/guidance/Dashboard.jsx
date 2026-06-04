import { Outlet } from 'react-router-dom';
import GuidanceNavbar from './components/GuidanceNavbar';
import Footer from '../../components/common/Footer';
import './components/Dashboard.css';

export default function GuidanceDashboard() {
  return (
    <div className="guidance-dashboard">
      <GuidanceNavbar />
      <main className="guidance-dashboard__content">
        <div className="guidance-dashboard__page">
          <Outlet />
        </div>
      </main>
      <Footer />
    </div>
  );
}
