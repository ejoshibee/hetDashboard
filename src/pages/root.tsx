import { Link, Outlet } from "react-router-dom";
import RBlogo from '../assets/RBlogo.svg'

export default function Root() {
  return (
    <div className="flex h-screen overflow-hidden">
      <div className="bg-yellow-bee-50 w-64 border-r border-neutral-300 overflow-y-auto">
        <img src={RBlogo} alt="RB Logo" />
        <div className="p-6">
          <nav className="space-y-6">
            <Link to="/" className="block text-title text-neutral-800 hover:text-oceanic-blue-600 transition duration-300">Home</Link>
            <Link to="/dashboard" className="block text-title text-neutral-800 hover:text-oceanic-blue-600 transition duration-300">Dashboard</Link>
            <Link to="/map" className="block text-title text-neutral-800 hover:text-oceanic-blue-600 transition duration-300">Map</Link>
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