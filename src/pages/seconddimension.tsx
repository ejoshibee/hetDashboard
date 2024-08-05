import React from 'react';

const SecondDimensionPage: React.FC = () => {
  return (
    <div className="h-full flex flex-col items-center justify-center bg-neutral-100">
      <main className="bg-neutral-000 p-8 rounded-lg shadow-lg max-w-2xl w-full">
        <h1 className="text-title-bold text-neutral-900 mb-4 font-sans">Welcome to the Second Dimension</h1>
        <p className="text-small text-neutral-700 mb-6 font-sans">
          This page represents the second dimension of our project. Here, we explore new concepts and ideas that extend beyond the first dimension.
        </p>
        <div className="bg-oceanic-blue-50 border-l-4 border-oceanic-blue-400 p-4">
          <p className="text-oceanic-blue-800 font-sans">
            Stay tuned for more content and interactive elements in this dimension!
          </p>
        </div>
      </main>
    </div>
  );
};

export default SecondDimensionPage;