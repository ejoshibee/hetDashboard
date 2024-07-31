import { isRouteErrorResponse, useNavigate, useRouteError } from 'react-router-dom';

const ErrorPage = () => {
  const error = useRouteError() as any;
  const navigate = useNavigate();

  console.error(error);

  if (isRouteErrorResponse(error)) {
    console.log("something errorful happened")
    console.log(error.status)
    console.log(error.data)
  }

  let errorMessage = 'An unexpected error occurred.';
  if (error?.status === 404) {
    errorMessage = 'No data found for the given criteria.';
  } else if (error?.statusText) {
    errorMessage = error.statusText;
  } else if (error?.message) {
    errorMessage = error.message;
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-4xl font-bold mb-4">Oops! Something went wrong.</h1>
      <p className="text-gray-600 mb-8">
        {errorMessage}
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