import React, { useContext } from 'react';
import { HashLink } from 'react-router-hash-link';
import { AuthContext } from '../App';
import Button from './Button';

const Header: React.FC = () => {
  const auth = useContext(AuthContext);

  const handleLogin = () => {
    // Simulate Google Login for user role
    auth.login({
      id: `user-${Date.now()}`,
      email: `user${Date.now()}@example.com`,
      name: `User ${Date.now()}`,
      role: 'user',
      createdAt: new Date().toISOString(),
    });
  };

  const handleAdminLogin = () => {
    // Simulate Google Login for admin role
    auth.login({
      id: `admin-${Date.now()}`,
      email: `admin${Date.now()}@example.com`,
      name: `Admin ${Date.now()}`,
      role: 'admin',
      createdAt: new Date().toISOString(),
    });
  };

  return (
    <header className="bg-blue-600 text-white p-4 shadow-md sticky top-0 z-10">
      <div className="container mx-auto flex justify-between items-center">
        <HashLink to="/" className="text-2xl font-bold">
          대학 도서관 좌석 예약
        </HashLink>
        <nav className="flex items-center space-x-4">
          <HashLink to="/" className="hover:text-blue-200">
            홈
          </HashLink>
          {auth.isLoggedIn && (
            <HashLink to="/me/reservations" className="hover:text-blue-200">
              내 예약
            </HashLink>
          )}
          {auth.isAdmin && (
            <HashLink to="/admin" className="hover:text-blue-200">
              관리자
            </HashLink>
          )}

          {auth.isLoggedIn ? (
            <div className="flex items-center space-x-2">
              <span className="text-sm">
                환영합니다, {auth.user?.name || auth.user?.email}! ({auth.user?.role === 'admin' ? '관리자' : '사용자'})
              </span>
              <Button variant="secondary" size="sm" onClick={auth.logout}>
                로그아웃
              </Button>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <Button variant="secondary" size="sm" onClick={handleLogin}>
                사용자로 로그인
              </Button>
              <Button variant="secondary" size="sm" onClick={handleAdminLogin}>
                관리자로 로그인
              </Button>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;
