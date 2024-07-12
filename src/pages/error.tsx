import { useNavigate, useRouteError } from 'react-router-dom';

const ErrorPage = () => {
  const error = useRouteError();
  const navigate = useNavigate();

  console.error(error);

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-4xl font-bold mb-4">Oops! Something went wrong.</h1>
      <p className="text-gray-600 mb-8">
        {(error as any)?.statusText || 'An unexpected error occurred.'}
      </p>
      <button
        className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
        onClick={() => navigate('/')}
      >
        Go to Home
      </button>
    </div>
  );
};

export default ErrorPage;
