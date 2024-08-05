import { Link, NavLink, Outlet } from "react-router-dom";
import { useState } from 'react';

import RBlogo from '../assets/RBlogo.svg';
import homeIcon from '../assets/homeIcon.png';
import dashboardIcon from '../assets/dashboardIcon.png';
import mapIcon from '../assets/mapIcon.png';
import tempIcon from '../assets/tempIcon.png'

export default function Root() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const iconStyling = `${isCollapsed ? 'w-7 h-7' : 'w-8 h-8'} transition-all duration-300`;
  const textStyling = `block px-6 text-button text-neutral-800 transition-all duration-300  max-w-full ${isCollapsed ? 'opacity-0 overflow-hidden' : 'opacity-100'}`;
  const linkStyling = `relative group p-2 ${isCollapsed ? 'pl-4' : 'pl-6'} w-full flex items-center transition-all duration-300 hover:bg-yellow-bee-200`;

  const StyledLink = (to: string, icon: string, text: string) => {
    return (
      <NavLink
        to={to}
        className={({ isActive }) => `
          ${linkStyling}
          ${isActive ? 'bg-yellow-bee-200' : ''}
        `}
        onMouseEnter={() => {
          console.log("hovering", text)
          setActiveTooltip(text)
        }}
        onMouseLeave={() => setActiveTooltip(null)}
      >
        <img src={icon} alt={text} className={iconStyling} />
        <span className={textStyling}>{text}</span>
        {/* Tool tip */}
        {isCollapsed && activeTooltip === text && (
          <div className="absolute left-full ml-2 z-10">
            <div className="bg-neutral-900 text-neutral-000 rounded-md py-1 px-2 text-small whitespace-nowrap">
              {text}
            </div>
            <div className="absolute top-1/2 -left-1 w-0 h-0 border-t-4 border-r-4 border-b-4 border-t-transparent border-r-neutral-900 border-b-transparent -translate-y-1/2"></div>
          </div>
        )}
      </NavLink>
    )
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <div className={`bg-neutral-000 ${isCollapsed ? 'w-16' : 'w-60'} border-r border-neutral-300 overflow-y-auto transition-width duration-300`}>
        <div className="flex items-start py-4">
          <Link to="/">
            <img src={RBlogo} alt="RB Logo" className={`h-12 cursor-pointer transition-all duration-300 ${isCollapsed ? 'opacity-0 w-0' : 'opacity-100 w-36'}`} />
          </Link>
          <button onClick={toggleSidebar} className={`focus:outline-none ${isCollapsed ? 'mx-auto' : 'ml-auto'}`}>
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
        <div className="mt-4">
          <nav>
            {StyledLink("/", homeIcon, "Home")}
            {StyledLink("/dashboard", dashboardIcon, "Dashboard")}
            {StyledLink("/map", mapIcon, "Map")}
            {StyledLink("/seconddimension", tempIcon, "2nd Dimension")}
            {StyledLink("/", tempIcon, "OTW!")}
            {StyledLink("/", tempIcon, "OTW!")}
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