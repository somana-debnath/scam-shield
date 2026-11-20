import { MotionConfig } from 'framer-motion';
import { lazy, Suspense } from 'react';
import { createBrowserRouter, Link, RouterProvider } from 'react-router-dom';
import { Layout } from './components/Layout';
import { EmptyState, PageSkeleton } from './components/States';
import Landing from './pages/Landing';

const Play = lazy(() => import('./pages/Play'));
const Game = lazy(() => import('./pages/Game'));
const Learn = lazy(() => import('./pages/Learn'));
const Certificate = lazy(() => import('./pages/Certificate'));

const wrap = (el: React.ReactNode) => <Suspense fallback={<PageSkeleton />}>{el}</Suspense>;

function NotFound() {
  return (
    <div className="container-page py-20">
      <EmptyState
        emoji="🧭"
        title="This page wandered off"
        action={<Link to="/" className="btn-primary">Take me home</Link>}
      >
        Good instinct to be suspicious of unfamiliar links, though!
      </EmptyState>
    </div>
  );
}

const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      { path: '/', element: <Landing /> },
      { path: '/play', element: wrap(<Play />) },
      { path: '/play/:levelId', element: wrap(<Game />) },
      { path: '/learn', element: wrap(<Learn />) },
      { path: '/certificate', element: wrap(<Certificate />) },
      { path: '*', element: <NotFound /> },
    ],
  },
]);

export default function App() {
  return (
    <MotionConfig reducedMotion="user">
      <RouterProvider router={router} />
    </MotionConfig>
  );
}
