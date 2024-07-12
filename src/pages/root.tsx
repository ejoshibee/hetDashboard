import { Link, Outlet } from "react-router-dom"

export default function Root() {
  return (
    <div className="flex h-screen">
      <div className="bg-gray-200 p-4 h-full w-64 border-r">
        <nav className="space-y-4">
          <Link to="/" className="block hover:text-blue-500">
            Home
          </Link>
          <Link to="/dashboard" className="block hover:text-blue-500">
            Dashboard
          </Link>
          <Link to="/map" className="block hover:text-blue-500">
            Map
          </Link>
        </nav>
      </div>
      <div className="flex-1 p-2">
        <header className="bg-gray-100 p-2 mb-2 border-b">
          <h1 className="text-2xl font-bold">Heterogenous Location Analyzer</h1>
        </header>
        <div className="p-2 border-2 rounded-md border-black">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
