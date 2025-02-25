import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'

import Dashboard, { loader as dashLoader } from './pages/dashboard'
import Map, { loader as mapLoader } from './pages/map'
import Root from './pages/root'
import Index from './pages/index'
import ErrorPage from './pages/error'
import SecondDimensionPage from './pages/seconddimension'

import { createBrowserRouter, RouterProvider } from 'react-router-dom';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Root />,
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        element: <Index />,
      },
      {
        path: 'dashboard',
        element: <Dashboard />,
        loader: dashLoader,
        errorElement: <ErrorPage />,
      },
      {
        path: 'map',
        element: <Map />,
        loader: mapLoader
      },
      {
        path: 'seconddimension',
        element: <SecondDimensionPage />,
      }
    ],
  },
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
)