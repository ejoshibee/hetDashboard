import { Link, Outlet } from "react-router-dom";

export default function Root() {
  return (
    <div className="flex h-screen">
      <div className="bg-gray-200 p-4 w-64 border-r">
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
      <div className="flex-1 flex flex-col">
        <header className="bg-gray-100 m-2 p-2 border-black border-2 rounded-md">
          <h1 className="text-2xl font-bold">Heterogenous Location Analyzer</h1>
        </header>
        <div className="flex-1 p-2">
          <div className="h-full p-2 border-2 rounded-md border-black overflow-auto">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}
