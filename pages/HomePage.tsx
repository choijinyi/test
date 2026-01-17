import React, { useState, useEffect, useContext, useCallback } from 'react';
import { AuthContext } from '../App';
import { fetchRoomsToday, createReservation, fetchAvailableSeatsForRoomAndTime } from '../services/api';
import { RoomAvailability, Seat, Reservation } from '../types';
import LoadingSpinner from '../components/LoadingSpinner';
import Button from '../components/Button';
import Modal from '../components/Modal';
// Add HashLink import
import { HashLink } from 'react-router-hash-link';

const HomePage: React.FC = () => {
  const auth = useContext(AuthContext);
  const [roomAvailabilities, setRoomAvailabilities] = useState<RoomAvailability[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [availableSeats, setAvailableSeats] = useState<Seat[]>([]);
  const [selectedSeatId, setSelectedSeatId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [reservationConfirmation, setReservationConfirmation] = useState<Reservation | null>(null);
  const [reserving, setReserving] = useState<boolean>(false);
  const [reservationError, setReservationError] = useState<string | null>(null);

  const loadRoomAvailabilities = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchRoomsToday();
      setRoomAvailabilities(data);
    } catch (err) {
      setError('Failed to fetch room availabilities.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRoomAvailabilities();
  }, [loadRoomAvailabilities]);

  const handleTimeSlotClick = async (roomId: string, time: string) => {
    setSelectedRoomId(roomId);
    setSelectedTime(time);
    setSelectedSeatId(null);
    setReservationError(null);

    if (auth.isLoggedIn) {
      // Fetch available seats for the selected room and time
      try {
        const seats = await fetchAvailableSeatsForRoomAndTime(roomId, time);
        setAvailableSeats(seats);
        setIsModalOpen(true);
      } catch (err) {
        setReservationError('Failed to fetch available seats.');
        console.error(err);
      }
    } else {
      setIsModalOpen(true); // Open modal to prompt login
    }
  };

  const handleSeatSelection = (seatId: string) => {
    setSelectedSeatId(seatId);
    setReservationError(null);
  };

  const handleReservation = async () => {
    if (!auth.isLoggedIn || !auth.user) {
      setReservationError('로그인 후 예약해주세요.');
      return;
    }
    if (!selectedRoomId || !selectedTime || !selectedSeatId) {
      setReservationError('좌석과 시간을 선택해주세요.');
      return;
    }

    setReserving(true);
    setReservationError(null);
    try {
      const newReservation = await createReservation(
        auth.user.id,
        selectedSeatId,
        selectedTime,
      );
      setReservationConfirmation(newReservation);
      setIsModalOpen(false); // Close seat selection modal
      // Refresh room availabilities to reflect the new reservation
      loadRoomAvailabilities();
    } catch (err: any) {
      setReservationError(err.message || '예약 중 오류가 발생했습니다.');
      console.error(err);
    } finally {
      setReserving(false);
    }
  };

  const closeReservationConfirmation = () => {
    setReservationConfirmation(null);
  };

  return (
    <div className="container mx-auto p-4 md:p-8">
      <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-6 text-center">
        오늘의 도서관 좌석 현황
      </h1>
      <p className="text-gray-600 mb-8 text-center max-w-2xl mx-auto">
        당일 좌석만 예약 가능하며, 1인 1일 1건으로 제한됩니다. 예약은 취소할 수 없습니다.
      </p>

      {loading && <LoadingSpinner />}
      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">{error}</div>}

      {!loading && !error && roomAvailabilities.length === 0 && (
        <p className="text-center text-gray-600">오늘 예약 가능한 열람실이 없습니다.</p>
      )}

      <div className="space-y-8">
        {roomAvailabilities.map((roomAvailability) => (
          <div key={roomAvailability.room.id} className="bg-white shadow-lg rounded-xl p-6 md:p-8 border border-gray-100 hover:shadow-xl transition-shadow duration-300 ease-in-out">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4 flex items-center">
              {roomAvailability.room.name}
              {!roomAvailability.room.isActive && (
                <span className="ml-2 px-3 py-1 bg-red-100 text-red-700 text-sm rounded-full">비활성화</span>
              )}
            </h2>
            <p className="text-gray-500 mb-6">
              운영 시간: {roomAvailability.room.openAt || '정보 없음'} - {roomAvailability.room.closeAt || '정보 없음'}
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {roomAvailability.timeSlots.map((slot) => (
                <Button
                  key={slot.time}
                  onClick={() => handleTimeSlotClick(roomAvailability.room.id, slot.time)}
                  variant={slot.availableSeats > 0 ? 'primary' : 'secondary'}
                  disabled={slot.availableSeats === 0 || !roomAvailability.room.isActive}
                  className="w-full text-center py-3 px-2 flex flex-col items-center justify-center text-sm md:text-base"
                >
                  <span className="font-semibold">{slot.time}</span>
                  <span className="text-xs md:text-sm">
                    {slot.availableSeats > 0 ? `${slot.availableSeats}석 남음` : '마감'}
                  </span>
                </Button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={auth.isLoggedIn ? `${selectedRoomId ? roomAvailabilities.find(r => r.room.id === selectedRoomId)?.room.name : ''} - ${selectedTime} 좌석 선택` : '로그인 필요'}
      >
        {!auth.isLoggedIn ? (
          <div className="text-center p-4">
            <p className="text-lg text-gray-700 mb-6">좌석을 예약하려면 로그인해야 합니다.</p>
            <Button onClick={() => { auth.login({ id: `user-${Date.now()}`, email: `user${Date.now()}@example.com`, name: `User ${Date.now()}`, role: 'user', createdAt: new Date().toISOString() }); setIsModalOpen(false); }} className="w-full sm:w-auto">
              사용자로 로그인하기
            </Button>
            <p className="mt-4 text-sm text-gray-500">
              <HashLink smooth to="/admin" className="text-blue-600 hover:underline">
                관리자 계정
              </HashLink>으로 로그인하려면 헤더에서 선택하세요.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {reserving ? (
              <LoadingSpinner />
            ) : (
              <>
                {reservationError && (
                  <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                    {reservationError}
                  </div>
                )}
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 max-h-60 overflow-y-auto pr-2">
                  {availableSeats.length > 0 ? (
                    availableSeats.map((seat) => (
                      <Button
                        key={seat.id}
                        variant={selectedSeatId === seat.id ? 'primary' : 'secondary'}
                        onClick={() => handleSeatSelection(seat.id)}
                        className="p-2 text-sm"
                      >
                        {seat.code}
                      </Button>
                    ))
                  ) : (
                    <p className="col-span-full text-center text-gray-600">선택한 시간에 예약 가능한 좌석이 없습니다.</p>
                  )}
                </div>
                <div className="mt-6 flex justify-end space-x-3">
                  <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
                    닫기
                  </Button>
                  <Button onClick={handleReservation} disabled={!selectedSeatId || reserving || availableSeats.length === 0}>
                    예약하기
                  </Button>
                </div>
              </>
            )}
          </div>
        )}
      </Modal>

      <Modal
        isOpen={!!reservationConfirmation}
        onClose={closeReservationConfirmation}
        title="예약 완료!"
      >
        {reservationConfirmation && (
          <div className="text-center p-4">
            <svg className="mx-auto h-16 w-16 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="mt-4 text-xl font-semibold text-gray-900">예약이 성공적으로 완료되었습니다!</h3>
            <p className="mt-2 text-gray-600">
              <strong>열람실:</strong> {reservationConfirmation.seat?.room?.name}<br />
              <strong>좌석 코드:</strong> {reservationConfirmation.seat?.code}<br />
              <strong>날짜:</strong> {reservationConfirmation.date}<br />
              <strong>시간:</strong> {reservationConfirmation.startTime} - {reservationConfirmation.endTime}
            </p>
            <p className="mt-4 text-sm text-gray-500">
              내 예약 페이지에서 예약 내역을 확인할 수 있습니다.
            </p>
            <div className="mt-6 flex justify-center space-x-3">
              <Button onClick={closeReservationConfirmation}>확인</Button>
              <HashLink smooth to="/me/reservations">
                <Button variant="secondary">내 예약 보기</Button>
              </HashLink>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default HomePage;