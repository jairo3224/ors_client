import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import './Footer.css';

const Footer = () => {
  const [year] = useState(new Date().getFullYear());

  // Dynamic greeting based on time of day (optional)
  const [greeting, setGreeting] = useState('');
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good morning');
    else if (hour < 18) setGreeting('Good afternoon');
    else setGreeting('Good evening');
  }, []);

  return (
    <footer className="footer">
      <div className="footer__container">
        {/* Brand / Info */}
        <div className="footer__section footer__brand">
          <h3 className="footer__logo">ORS – OSAS</h3>
          <p className="footer__desc">
            Online Referral System for the Office of Student Affairs and Services.
            Streamlining student support, one referral at a time.
          </p>
          <p className="footer__greeting">{greeting}! 👋</p>
        </div>

        {/* Quick Links */}
        <div className="footer__section">
          <h4 className="footer__heading">Quick Links</h4>
          <ul className="footer__links">
            <li><Link to="/chairperson/dashboard">Chairperson Dashboard</Link></li>
            <li><Link to="/guidance/dashboard">Guidance Dashboard</Link></li>
            <li><Link to="/chaplain/dashboard">Chaplain Dashboard</Link></li>
            <li><Link to="/teacher/dashboard">Teacher Dashboard</Link></li>
            <li><Link to="/osas/dashboard">OSAS Admin</Link></li>
          </ul>
        </div>

        {/* Contact Info */}
        <div className="footer__section">
          <h4 className="footer__heading">Contact OSAS</h4>
          <ul className="footer__contact">
            <li>📍 Student Center, Room 101</li>
            <li>📞 (02) 1234-5678</li>
            <li>📧 osas@university.edu.ph</li>
            <li>🕒 Mon–Fri, 8:00 AM – 5:00 PM</li>
          </ul>
        </div>

        {/* Social / External Links */}
        <div className="footer__section">
          <h4 className="footer__heading">Connect With Us</h4>
          <div className="footer__social">
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
              <i className="footer__icon">📘</i>
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter">
              <i className="footer__icon">🐦</i>
            </a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
              <i className="footer__icon">📷</i>
            </a>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="footer__bottom">
        <p>&copy; {year} Online Referral System – Office of Student Affairs and Services. All rights reserved.</p>
        <p className="footer__tagline">For official use only. Confidential.</p>
      </div>
    </footer>
  );
};

export default Footer;