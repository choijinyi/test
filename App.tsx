import React, { useState, useEffect, createContext, useCallback } from 'react';
import { HashRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import MyReservationsPage from './pages/MyReservationsPage';
import AdminDashboard from './pages/AdminDashboard';
import LoadingSpinner from './components/LoadingSpinner';
import { User, AuthContextType } from './types';
import { getAuthStatus, loginUser, logoutUser } from './services/api';
// Add HashLink import
import { HashLink } from 'react-router-hash-link';

export const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoggedIn: false,
  login: () => {},
  logout: () => {},
  isAdmin: false,
});

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loadingAuth, setLoadingAuth] = useState<boolean>(true);
  const navigate = useNavigate();

  const handleLogin = useCallback(async (userData: User) => {
    // In a real app, this would involve API calls to /auth/google
    // For this mock, we directly set the user.
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData)); // Persist mock login
    navigate('/');
  }, [navigate]);

  const handleLogout = useCallback(async () => {
    await logoutUser(); // Clear mock user on backend
    setUser(null);
    localStorage.removeItem('user'); // Clear persisted mock login
    navigate('/');
  }, [navigate]);

  useEffect(() => {
    const checkAuth = async () => {
      setLoadingAuth(true);
      try {
        // In a real app, this would verify a session cookie or token
        // For mock, try to restore from localStorage
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          const parsedUser: User = JSON.parse(storedUser);
          setUser(parsedUser);
        } else {
          // Simulate backend auth check
          const authUser = await getAuthStatus();
          setUser(authUser);
        }
      } catch (error) {
        console.error('Failed to check auth status:', error);
        setUser(null);
      } finally {
        setLoadingAuth(false);
      }
    };
    checkAuth();
  }, []);

  const authContextValue: AuthContextType = {
    user,
    isLoggedIn: !!user,
    login: handleLogin,
    logout: handleLogout,
    isAdmin: user?.role === 'admin',
  };

  if (loadingAuth) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <LoadingSpinner />
        <p className="ml-3 text-lg text-gray-700">인증 정보를 확인 중입니다...</p>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={authContextValue}>
      <div className="flex flex-col min-h-screen bg-gray-50">
        <Header />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/me/reservations" element={<MyReservationsPage />} />
            <Route path="/admin" element={<AdminDashboard />} />
            {/* Add more routes here as needed */}
            <Route path="*" element={
              <div className="container mx-auto p-8 text-center">
                <h1 className="text-4xl font-bold text-gray-900 mb-4">404 - 페이지를 찾을 수 없습니다</h1>
                <p className="text-lg text-gray-700">요청하신 페이지가 존재하지 않거나 이동되었습니다.</p>
                <HashLink smooth to="/" className="mt-6 inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
                  홈으로 돌아가기
                </HashLink>
              </div>
            } />
          </Routes>
        </main>
        <Footer />
      </div>
    </AuthContext.Provider>
  );
};

const AppWrapper: React.FC = () => (
  <Router>
    <App />
  </Router>
);

export default AppWrapper;