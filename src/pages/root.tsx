import { Link, Outlet } from "react-router-dom";
import { useState } from 'react';

import RBlogo from '../assets/RBlogo.svg';
import homeIcon from '../assets/homeIcon.png';  // replace with actual paths
import dashboardIcon from '../assets/dashboardIcon.png';
import mapIcon from '../assets/mapIcon.png';

export default function Root() {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <div className={`bg-neutral-000 ${isCollapsed ? 'w-16' : 'w-64'} border-r border-neutral-300 overflow-y-auto transition-width duration-300`}>
        <div className="flex items-start p-4">
          <Link to="/">
            <img src={RBlogo} alt="RB Logo" className={`cursor-pointer transition-all duration-300 ${isCollapsed ? 'opacity-0 w-0' : 'opacity-100 w-36'}`} />
          </Link>
          <button onClick={toggleSidebar} className="ml-auto focus:outline-none">
            <svg
              className="w-6 h-6 text-neutral-800"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d={isCollapsed ? 'M9 19l7-7-7-7' : 'M15 19l-7-7 7-7'}
              />
            </svg>
          </button>
        </div>
        <div className="py-6">
          <nav>
            <Link to="/" className="p-2 w-full hover:bg-yellow-bee-400 transition duration-300 flex items-center">
              <img src={homeIcon} alt="Home" className={`w-6 h-6 transition-transform duration-300 ${isCollapsed ? '-translate-y-6' : 'translate-y-0'}`} />
              <span className={`block px-6 text-title text-neutral-800 transition-all duration-300 ${isCollapsed ? 'opacity-0 max-w-0 -translate-y-6' : 'opacity-100 max-w-full translate-y-0'}`}>Home</span>
            </Link>
            <Link to="/dashboard" className="p-2 w-full hover:bg-yellow-bee-400 transition duration-300 flex items-center">
              <img src={dashboardIcon} alt="Dashboard" className={`w-6 h-6 transition-transform duration-300 ${isCollapsed ? '-translate-y-6' : 'translate-y-0'}`} />
              <span className={`block px-6 text-title text-neutral-800 transition-all duration-300 ${isCollapsed ? 'opacity-0 max-w-0 -translate-y-6' : 'opacity-100 max-w-full translate-y-0'}`}>Dashboard</span>
            </Link>
            <Link to="/map" className="p-2 w-full hover:bg-yellow-bee-400 transition duration-300 flex items-center">
              <img src={mapIcon} alt="Map" className={`w-6 h-6 transition-transform duration-300 ${isCollapsed ? '-translate-y-6' : 'translate-y-0'}`} />
              <span className={`block px-6 text-title text-neutral-800 transition-all duration-300 ${isCollapsed ? 'opacity-0 max-w-0 -translate-y-6' : 'opacity-100 max-w-full translate-y-0'}`}>Map</span>
            </Link>
          </nav>
        </div>
      </div>
      <div className="flex flex-col flex-1 overflow-hidden">
        <header className="bg-neutral-100 p-6 border-b border-neutral-300">
          <h1 className="text-title-bold text-neutral-900">Anomaly Detection and Prevention</h1>
        </header>
        <main className="flex-1 p-6 overflow-hidden">
          <div className="h-full border rounded-lg border-neutral-300 overflow-auto p-4 bg-neutral-000">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}