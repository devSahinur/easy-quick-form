import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import { lazy, Suspense, type ReactNode } from 'react';
import AuthLayout from './layouts/AuthLayout';
import BaseLayout from './layouts/BaseLayout';
import RequireAuth from './components/auth/RequireAuth';
import PersistLogin from './components/auth/PersistLogin';
import Error from './pages/Error';

// Route components are lazy-loaded so each page ships in its own chunk
// instead of one large bundle.
const Login = lazy(() => import('./pages/auth/Login'));
const Signup = lazy(() => import('./pages/auth/Signup'));
const RecoverPassword = lazy(() => import('./pages/auth/RecoverPassword'));
const ResetPassword = lazy(() => import('./pages/auth/ResetPassword'));
const CreateForm = lazy(() => import('./pages/CreateForm'));
const MyForms = lazy(() => import('./pages/MyForms'));
const UpdateForm = lazy(() => import('./pages/UpdateForm'));
const Settings = lazy(() => import('./pages/Settings'));
const GeneratedForm = lazy(() => import('./pages/GeneratedForm'));

function PageLoader() {
  return (
    <div className="flex h-screen w-full items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
    </div>
  );
}

const lazyRoute = (node: ReactNode) => (
  <Suspense fallback={<PageLoader />}>{node}</Suspense>
);

const router = createBrowserRouter([
  {
    element: <AuthLayout />,
    errorElement: <Error />,
    children: [
      { path: '/login', element: lazyRoute(<Login />) },
      { path: '/signup', element: lazyRoute(<Signup />) },
      { path: '/recover-password', element: lazyRoute(<RecoverPassword />) },
      { path: '/reset-password/:token', element: lazyRoute(<ResetPassword />) },
      { path: '/demo', element: lazyRoute(<CreateForm />) },
    ],
  },
  {
    element: <PersistLogin />,
    errorElement: <Error />,
    children: [
      {
        element: <RequireAuth />,
        children: [
          {
            element: <BaseLayout />,
            children: [
              { path: '/', element: lazyRoute(<CreateForm />) },
              { path: '/my-forms', element: lazyRoute(<MyForms />) },
              {
                path: '/my-forms/:id/edit',
                element: lazyRoute(<UpdateForm />),
              },
              { path: '/settings', element: lazyRoute(<Settings />) },
            ],
          },
        ],
      },
    ],
  },
  {
    path: 'forms/:id',
    element: lazyRoute(<GeneratedForm />),
    errorElement: <Error />,
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}
