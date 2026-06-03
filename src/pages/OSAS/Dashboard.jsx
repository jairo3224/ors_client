import { Outlet } from 'react-router-dom';
import OsasNavbar from './components/OsasNavbar';
import Footer from '../../components/common/Footer';
import './components/Dashboard.css';

export default function Dashboard() {
  return (
    <div className="osas-dashboard">
      <OsasNavbar />
      <main className="osas-dashboard__content">
        <div className="osas-dashboard__page">
          <Outlet />
        </div>
      </main>
      <Footer />
    </div>
  );
}
