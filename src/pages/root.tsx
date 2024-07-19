import { Link, Outlet } from "react-router-dom";

export default function Root() {
  return (
    <div className="flex h-screen overflow-hidden">
      <div className="bg-gray-200 p-4 w-64 border-r overflow-y-auto">
        <nav className="space-y-4">
          <Link to="/" className="block hover:text-blue-500">Home</Link>
          <Link to="/dashboard" className="block hover:text-blue-500">Dashboard</Link>
          <Link to="/map" className="block hover:text-blue-500">Map</Link>
        </nav>
      </div>
      <div className="flex flex-col flex-1 overflow-hidden">
        <header className="bg-gray-100 p-2 border-b">
          <h1 className="text-2xl font-bold">Anomaly Detection and Prevention</h1>
        </header>
        <main className="flex-1 p-2 overflow-hidden">
          <div className="h-full border-2 rounded-md border-black overflow-auto p-2">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
