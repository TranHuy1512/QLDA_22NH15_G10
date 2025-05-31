import { Link } from 'react-router-dom';
import { Button } from './FormComponents.jsx';
import { useAuth } from '../context/authContext.jsx';

const Home = () => {
  const { logout } = useAuth();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 text-center">
        <h1 className="text-4xl font-bold text-gray-900">
          Welcome to Task Management
        </h1>
        <p className="mt-2 text-gray-600">
          Manage your team's tasks efficiently
        </p>
        <div className="mt-8 space-x-4">
          <Link
            to="/register"
            className="inline-block px-6 py-3 bg-indigo-600 text-white font-medium rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Register
          </Link>
          <Link
            to="/login"
            className="inline-block px-6 py-3 bg-white text-indigo-600 font-medium rounded-md border border-indigo-600 hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Login
          </Link>
          <Button onClick={logout}>Logout</Button>
        </div>
      </div>
    </div>
  );
};

export default Home; 