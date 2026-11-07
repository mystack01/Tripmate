import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import { useAuth } from './AuthContext.jsx';
import Landing from './pages/Landing.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Dashboard from './pages/Dashboard.jsx';
import TripForm from './pages/TripForm.jsx';
import TripDetail from './pages/TripDetail.jsx';
import Admin from './pages/Admin.jsx';
import NotFound from './pages/NotFound.jsx';

function Home() {
  const { user, loading } = useAuth();
  if (loading) return <div className="container page"><p role="status">Loading…</p></div>;
  return user ? <Dashboard /> : <Landing />;
}

export default function App() {
  return (
    <>
      <a href="#main" className="skip-link">Skip to main content</a>
      <Navbar />
      <main id="main">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/trips/new" element={<ProtectedRoute><TripForm /></ProtectedRoute>} />
          <Route path="/trips/:id" element={<ProtectedRoute><TripDetail /></ProtectedRoute>} />
          <Route path="/trips/:id/edit" element={<ProtectedRoute><TripForm /></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute adminOnly><Admin /></ProtectedRoute>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <footer className="footer">
        <div className="container">
          TripMate uses Open-Meteo, World Bank, mledoze/countries, ExchangeRate-API and OpenStreetMap.
        </div>
      </footer>
    </>
  );
}
