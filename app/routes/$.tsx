import { type LoaderFunction } from 'react-router';

export const loader: LoaderFunction = () => {
  throw new Response('Not Found', { status: 404 });
};

export default function CatchAll() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
      <p className="text-gray-600 mb-8">Page not found</p>
      <a 
        href="/" 
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      >
        Go Home
      </a>
    </div>
  );
}
