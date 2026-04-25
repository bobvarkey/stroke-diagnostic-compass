import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-black relative overflow-hidden">
      {/* Animated background glow blobs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-fuchsia-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />

      <div className="relative z-10 text-center px-6">
        <div className="mb-8 inline-block">
          <div className="text-9xl font-bold bg-gradient-to-r from-fuchsia-400 to-cyan-400 bg-clip-text text-transparent drop-shadow-lg">
            404
          </div>
        </div>
        <h1 className="mb-4 text-3xl md:text-4xl font-bold text-white">
          Page Not Found
        </h1>
        <p className="mb-8 text-lg text-gray-300 max-w-md mx-auto">
          The page you're looking for doesn't exist or has been moved. Let's get you back on track.
        </p>
        <a
          href="/"
          className="inline-block px-8 py-4 bg-gradient-to-r from-fuchsia-600 to-cyan-500 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-fuchsia-500/50 transition-all duration-300 transform hover:scale-105"
        >
          Return to Home
        </a>
      </div>
    </div>
  );
};

export default NotFound;
