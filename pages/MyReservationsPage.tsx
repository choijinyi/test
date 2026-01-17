import React, { useContext, useEffect, useState, useCallback } from 'react';
import { AuthContext } from '../App';
import { fetchMyReservation } from '../services/api';
import { Reservation } from '../types';
import LoadingSpinner from '../components/LoadingSpinner';
import Button from '../components/Button';
// Add HashLink import
import { HashLink } from 'react-router-hash-link';

const MyReservationsPage: React.FC = () => {
  const auth = useContext(AuthContext);
  const [reservation, setReservation] = useState<Reservation | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadMyReservation = useCallback(async () => {
    if (!auth.isLoggedIn || !auth.user) {
      setError('로그인이 필요합니다.');
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await fetchMyReservation(auth.user.id);
      setReservation(data);
    } catch (err) {
      setError('예약 내역을 불러오는 데 실패했습니다.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [auth.isLoggedIn, auth.user]);

  useEffect(() => {
    loadMyReservation();
  }, [loadMyReservation]);

  if (!auth.isLoggedIn) {
    return (
      <div className="container mx-auto p-4 md:p-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">로그인 필요</h1>
        <p className="text-lg text-gray-700 mb-6">예약 내역을 보려면 로그인해야 합니다.</p>
        <Button onClick={() => auth.login({ id: `user-${Date.now()}`, email: `user${Date.now()}@example.com`, name: `User ${Date.now()}`, role: 'user', createdAt: new Date().toISOString() })}>
          사용자로 로그인하기
        </Button>
        <p className="mt-4 text-sm text-gray-500">
          <HashLink smooth to="/" className="text-blue-600 hover:underline">
            홈으로 돌아가기
          </HashLink>
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-8">
      <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-6 text-center">
        내 오늘의 예약
      </h1>

      {loading && <LoadingSpinner />}
      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">{error}</div>}

      {!loading && !error && (
        reservation ? (
          <div className="bg-white shadow-lg rounded-xl p-6 md:p-8 border border-gray-100 max-w-lg mx-auto">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">예약 상세</h2>
            <div className="space-y-3 text-gray-700">
              <p><strong>예약 번호:</strong> {reservation.id}</p>
              <p><strong>열람실:</strong> {reservation.seat?.room?.name || '정보 없음'}</p>
              <p><strong>좌석 코드:</strong> {reservation.seat?.code || '정보 없음'}</p>
              <p><strong>예약 날짜:</strong> {reservation.date}</p>
              <p><strong>예약 시간:</strong> {reservation.startTime} - {reservation.endTime}</p>
              <p><strong>상태:</strong> <span className={`font-semibold ${reservation.status === 'active' ? 'text-green-600' : 'text-gray-500'}`}>{reservation.status === 'active' ? '활성' : reservation.status}</span></p>
              <p className="text-sm text-gray-500 mt-4">예약은 취소하거나 변경할 수 없습니다.</p>
            </div>
          </div>
        ) : (
          <div className="bg-white shadow-lg rounded-xl p-6 md:p-8 border border-gray-100 max-w-lg mx-auto text-center">
            <p className="text-lg text-gray-700 mb-6">오늘 예약된 좌석이 없습니다.</p>
            <HashLink smooth to="/">
              <Button>지금 예약하기</Button>
            </HashLink>
          </div>
        )
      )}
    </div>
  );
};

export default MyReservationsPage;