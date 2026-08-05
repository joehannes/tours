import React, { useState, useEffect } from 'react';
import { Link, NavLink, useLocation, useSearchParams, useNavigate } from 'react-router-dom';
import { FormattedMessage } from 'react-intl';
import { HiMenu, HiX, HiSparkles } from 'react-icons/hi';
import { MdHome, MdTour, MdLocalTaxi, MdEmail, MdLibraryBooks, MdSettings } from 'react-icons/md';
import { FaBook, FaTiktok, FaShareAlt, FaRobot, FaMagic, FaSignOutAlt } from 'react-icons/fa';
import LanguageSwitcher from '../LanguageSwitcher';
import SoundToggle from '../SoundToggle';
import { useBrand } from '../../contexts/BrandContext';
import { playClickFx, playHoverFx } from '../../lib/soundEngine';

import { getAdminPassword, clearAdminPassword } from '../../services/authStore';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { brandSettings } = useBrand();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isAuthenticated, setIsAuthenticated] = useState(!!getAdminPassword());

  useEffect(() => {
    const handleAuthChange = () => setIsAuthenticated(!!getAdminPassword());
    window.addEventListener('authChange', handleAuthChange);
    return () => window.removeEventListener('authChange', handleAuthChange);
  }, []);

  const isAdminRoute = location.pathname.startsWith('/admin') && isAuthenticated;

  const handleLogout = () => {
    clearAdminPassword();
    navigate('/');
  };

  const adminNavClass = (section: string) => {
    const currentSection = searchParams.get('section') || 'brand';
    return `nav-link-pill p-3 !rounded-full transition ${currentSection === section ? 'bg-teal-600/15 text-teal-800 ring-1 ring-teal-600/25' : 'text-slate-600 hover:bg-slate-100'}`;
  };

  const handleNavClick = () => {
    playClickFx();
    setIsMenuOpen(false);
  };

  // Active route gets a filled pill so guests always know where they are.
  const navClass = ({ isActive }: { isActive: boolean }) =>
    `nav-link-pill ${isActive ? 'bg-teal-600/15 text-teal-800 ring-1 ring-teal-600/25' : ''}`;

  return (
    <header className="lobster-header sticky top-0 z-50 overflow-visible border-b border-white/30 bg-white/70 shadow-[0_8px_32px_rgba(8,42,62,.15)] backdrop-blur-xl">
      <div className="section-shell flex items-center justify-between py-3.5 pl-[7.25rem] sm:pl-[7.75rem] lg:pl-8">
        <Link
          to="/#top"
          className="group flex items-center gap-3"
          onClick={() => playClickFx()}
          onMouseEnter={() => playHoverFx()}
        >
          <div className="menu-logo-icon fixed left-4 top-2 flex h-[6.125rem] w-[6.125rem] items-center justify-center rounded-full bg-gradient-to-br from-white/90 to-cyan-50/70 shadow-[0_0_30px_rgba(251,146,60,0.95),0_0_60px_rgba(251,146,60,0.6),0_0_100px_rgba(251,146,60,0.3)] ring-1 ring-white/50 overflow-hidden backdrop-blur-md transition-transform duration-500 group-hover:scale-105 sm:left-6 lg:left-[max(2rem,calc((100vw-80rem)/2+2rem))]">
            {brandSettings.brandicon ? (
              <img src={brandSettings.brandicon} alt="Logo" className="h-full w-full object-cover" />
            ) : (
              <img src="/competitor-logo.svg" alt="Logo" className="h-[5.25rem] w-[5.25rem]" />
            )}
          </div>
          <h1 className="hidden text-2xl font-bold text-slate-900 transition group-hover:text-teal-700 sm:block sm:ml-[7.5rem] lg:ml-[8rem] relative">
            <span className="relative z-10">{brandSettings.brandName}</span>
            <span className="absolute inset-0 -top-1 -left-2 -right-2 -bottom-1 bg-gradient-to-r from-orange-300/30 via-orange-400/20 to-amber-300/30 rounded-lg blur-sm opacity-60 group-hover:opacity-80 transition-opacity duration-300"></span>
          </h1>
        </Link>

        <button
          className="grid h-11 w-11 place-items-center rounded-full bg-white/60 text-slate-800 ring-1 ring-white/50 backdrop-blur-md hover:bg-white/80 transition md:hidden"
          onClick={() => {
            playClickFx();
            setIsMenuOpen(!isMenuOpen);
          }}
          aria-label="Toggle navigation"
        >
          {isMenuOpen ? <HiX className="h-8 w-8" /> : <HiMenu className="h-8 w-8" />}
        </button>

        <nav
          className={`${isMenuOpen ? 'flex' : 'hidden'} absolute left-3 right-3 top-[calc(100%+10px)] flex-col gap-3 rounded-[28px] border border-white/40 bg-white/85 px-6 py-6 shadow-[0_16px_48px_rgba(8,42,62,.16)] backdrop-blur-2xl md:static md:flex md:flex-row md:items-center md:gap-3 md:border-0 md:bg-transparent md:p-0 md:shadow-none`}
        >
          {isAdminRoute ? (
            <>
              <Link to="/admin?section=brand" onClick={handleNavClick} className={adminNavClass('brand')} title="Brand Settings">
                <MdSettings className="h-6 w-6" />
              </Link>
              <Link to="/admin?section=story" onClick={handleNavClick} className={adminNavClass('story')} title="Story">
                <FaBook className="h-5 w-5" />
              </Link>
              <Link to="/admin?section=tours" onClick={handleNavClick} className={adminNavClass('tours')} title="Tours">
                <MdTour className="h-6 w-6" />
              </Link>
              <Link to="/admin?section=transport" onClick={handleNavClick} className={adminNavClass('transport')} title="Transport">
                <MdLocalTaxi className="h-6 w-6" />
              </Link>
              <Link to="/admin?section=tiktok" onClick={handleNavClick} className={adminNavClass('tiktok')} title="TikTok">
                <FaTiktok className="h-5 w-5" />
              </Link>
              <Link to="/admin?section=social" onClick={handleNavClick} className={adminNavClass('social')} title="Social">
                <FaShareAlt className="h-5 w-5" />
              </Link>
              <Link to="/admin?section=aiSettings" onClick={handleNavClick} className={adminNavClass('aiSettings')} title="AI Config">
                <FaRobot className="h-5 w-5" />
              </Link>
              <Link to="/admin?section=aiBlogGen" onClick={handleNavClick} className={adminNavClass('aiBlogGen')} title="AI Blog Gen">
                <FaMagic className="h-5 w-5" />
              </Link>
              <div className="w-px h-6 bg-slate-300 mx-1 hidden md:block"></div>
              <button onClick={handleLogout} className="nav-link-pill p-3 !rounded-full text-red-600 hover:bg-red-50 ring-1 ring-red-100 transition" title="Log Out & Return">
                <FaSignOutAlt className="h-5 w-5" />
              </button>
            </>
          ) : (
            <>
              <NavLink to="/#top" end onClick={handleNavClick} onMouseEnter={() => playHoverFx()} className={navClass}>
                <MdHome />
                <FormattedMessage id="nav.home" />
              </NavLink>

              {/* The planner gets its own accented tab — it is the fastest way in. */}
              <NavLink
                to="/plan#top"
                onClick={handleNavClick}
                onMouseEnter={() => playHoverFx()}
                className={({ isActive }) =>
                  `flex items-center gap-2 rounded-full px-4 py-2 font-bold transition duration-300 ${
                    isActive
                      ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-[0_10px_26px_rgba(13,148,136,.35)]'
                      : 'bg-gradient-to-r from-teal-500/15 to-amber-400/15 text-teal-800 ring-1 ring-teal-500/30 hover:from-teal-500/25 hover:to-amber-400/25'
                  }`
                }
              >
                <HiSparkles className="h-4 w-4" />
                <FormattedMessage id="nav.plan" defaultMessage="Plan" />
              </NavLink>

              <NavLink to="/tours#top" onClick={handleNavClick} onMouseEnter={() => playHoverFx()} className={navClass}>
                <MdTour />
                <FormattedMessage id="nav.tours" />
              </NavLink>
              <NavLink to="/transport#top" onClick={handleNavClick} onMouseEnter={() => playHoverFx()} className={navClass}>
                <MdLocalTaxi />
                <FormattedMessage id="nav.transport" defaultMessage="Transport" />
              </NavLink>
              <NavLink to="/blog#top" onClick={handleNavClick} onMouseEnter={() => playHoverFx()} className={navClass}>
                <MdLibraryBooks />
                <FormattedMessage id="nav.blog" defaultMessage="Blog" />
              </NavLink>
              <NavLink to="/contact#top" onClick={handleNavClick} onMouseEnter={() => playHoverFx()} className={navClass}>
                <MdEmail />
                <FormattedMessage id="nav.contact" />
              </NavLink>
            </>
          )}
          <div className="flex items-center gap-3 pt-2 md:pt-0">
            <LanguageSwitcher />
            <SoundToggle />
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header;

