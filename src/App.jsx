import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { StatementProvider } from './context/StatementContext';
import Navbar         from './components/Navbar';
import CategorySidebar from './components/CategorySidebar';
import UploadPage    from './pages/UploadPage';
import LoadingPage   from './pages/LoadingPage';
import DashboardPage from './pages/DashboardPage';
import { Link, useLocation } from 'react-router-dom';

const NavAction = () => {
  const loc = useLocation();
  if (loc.pathname === '/upload' || loc.pathname === '/') {
    return (
      <Link
        to="/dashboard"
        className="text-xs font-medium px-3 py-1.5 rounded-lg"
        style={{ border: '1px solid #534AB7', color: '#534AB7' }}
        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#534AB7'; e.currentTarget.style.color = '#fff'; }}
        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#534AB7'; }}
      >
        View Dashboard
      </Link>
    );
  }
  return (
    <Link
      to="/upload"
      className="text-xs font-medium px-3 py-1.5 rounded-lg"
      style={{ border: '1px solid #534AB7', color: '#534AB7' }}
      onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#534AB7'; e.currentTarget.style.color = '#fff'; }}
      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#534AB7'; }}
    >
      Upload new
    </Link>
  );
};

const Shell = () => (
  <div className="min-h-screen" style={{ backgroundColor: '#f8f8f6' }}>
    <Navbar actionButton={<NavAction />} />
    <div className="flex" style={{ minHeight: 'calc(100vh - 56px)' }}>
      <CategorySidebar />
      <div className="flex-1 min-w-0">
        <Routes>
          <Route path="/"          element={<Navigate to="/upload" replace />} />
          <Route path="/upload"    element={<UploadPage />} />
          <Route path="/loading"   element={<LoadingPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="*"          element={<Navigate to="/upload" replace />} />
        </Routes>
      </div>
    </div>
  </div>
);

function App() {
  return (
    <StatementProvider>
      <Router>
        <Shell />
      </Router>
    </StatementProvider>
  );
}

export default App;
