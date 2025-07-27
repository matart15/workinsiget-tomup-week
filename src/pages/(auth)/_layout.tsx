import { Outlet } from 'react-router-dom';

export default function AuthRoute() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-muted">
      <div className="w-full max-w-md mx-auto bg-background shadow-lg min-h-screen flex flex-col justify-center">
        <Outlet />
      </div>
    </div>
  );
}
