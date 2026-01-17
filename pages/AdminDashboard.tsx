import React, { useState, useEffect, useContext, useCallback } from 'react';
import { AuthContext } from '../App';
import { HashLink } from 'react-router-hash-link';
import {
  adminFetchRooms,
  adminCreateRoom,
  adminUpdateRoom,
  adminDeleteRoom,
  adminFetchSeats,
  adminCreateSeat,
  adminUpdateSeat,
  adminDeleteSeat,
  adminFetchAllReservations,
  adminCancelReservation,
} from '../services/api';
import { Room, Seat, Reservation, ReservationStatus } from '../types';
import LoadingSpinner from '../components/LoadingSpinner';
import Button from '../components/Button';
import Modal from '../components/Modal';

// --- Room Management Component ---
interface RoomFormProps {
  room?: Room;
  onSave: (roomData: Omit<Room, 'id' | 'seats' | 'totalSeats' | 'availableSeats'>) => void;
  onCancel: () => void;
  loading: boolean;
  error: string | null;
}

const RoomForm: React.FC<RoomFormProps> = ({ room, onSave, onCancel, loading, error }) => {
  const [name, setName] = useState(room?.name || '');
  const [isActive, setIsActive] = useState(room?.isActive ?? true);
  const [openAt, setOpenAt] = useState(room?.openAt || '09:00');
  const [closeAt, setCloseAt] = useState(room?.closeAt || '22:00');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ name, isActive, openAt, closeAt });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">{error}</div>}
      <div>
        <label htmlFor="roomName" className="block text-sm font-medium text-gray-700">열람실 이름</label>
        <input
          type="text"
          id="roomName"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>
      <div>
        <label htmlFor="openAt" className="block text-sm font-medium text-gray-700">운영 시작 시간</label>
        <input
          type="time"
          id="openAt"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2"
          value={openAt}
          onChange={(e) => setOpenAt(e.target.value)}
          required
        />
      </div>
      <div>
        <label htmlFor="closeAt" className="block text-sm font-medium text-gray-700">운영 종료 시간</label>
        <input
          type="time"
          id="closeAt"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2"
          value={closeAt}
          onChange={(e) => setCloseAt(e.target.value)}
          required
        />
      </div>
      <div className="flex items-center">
        <input
          id="isActive"
          name="isActive"
          type="checkbox"
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          checked={isActive}
          onChange={(e) => setIsActive(e.target.checked)}
        />
        <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">활성화</label>
      </div>
      <div className="flex justify-end space-x-3">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={loading}>
          취소
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? <LoadingSpinner /> : (room ? '수정' : '추가')}
        </Button>
      </div>
    </form>
  );
};


const RoomManagement: React.FC = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState<boolean>(false);
  const [currentRoom, setCurrentRoom] = useState<Room | null>(null);
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const fetchRooms = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminFetchRooms();
      setRooms(data);
    } catch (err) {
      setError('열람실 목록을 불러오는 데 실패했습니다.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRooms();
  }, [fetchRooms]);

  const handleAddRoom = () => {
    setCurrentRoom(null);
    setActionError(null);
    setIsFormModalOpen(true);
  };

  const handleEditRoom = (room: Room) => {
    setCurrentRoom(room);
    setActionError(null);
    setIsFormModalOpen(true);
  };

  const handleSaveRoom = async (roomData: Omit<Room, 'id' | 'seats' | 'totalSeats' | 'availableSeats'>) => {
    setActionLoading(true);
    setActionError(null);
    try {
      if (currentRoom) {
        await adminUpdateRoom(currentRoom.id, roomData);
      } else {
        await adminCreateRoom(roomData);
      }
      await fetchRooms(); // Refresh list
      setIsFormModalOpen(false);
    } catch (err: any) {
      setActionError(err.message || '열람실 저장 중 오류가 발생했습니다.');
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteRoom = async (roomId: string) => {
    if (!window.confirm('정말로 이 열람실을 삭제하시겠습니까? 관련 좌석 및 예약도 삭제됩니다.')) return;
    setActionLoading(true);
    setActionError(null);
    try {
      await adminDeleteRoom(roomId);
      await fetchRooms(); // Refresh list
    } catch (err: any) {
      setActionError(err.message || '열람실 삭제 중 오류가 발생했습니다.');
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-8 bg-white shadow-xl rounded-lg">
      <h2 className="text-3xl font-bold text-gray-900 mb-6 flex justify-between items-center">
        열람실 관리
        <Button onClick={handleAddRoom}>열람실 추가</Button>
      </h2>

      {loading && <LoadingSpinner />}
      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">{error}</div>}
      {actionError && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">{actionError}</div>}

      {!loading && rooms.length === 0 && <p className="text-gray-600">등록된 열람실이 없습니다.</p>}

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200 rounded-lg">
          <thead className="bg-gray-50">
            <tr>
              <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">이름</th>
              <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">운영 시간</th>
              <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">활성화</th>
              <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">좌석 수</th>
              <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">관리</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {rooms.map((room) => (
              <tr key={room.id} className="hover:bg-gray-50">
                <td className="py-4 px-6 whitespace-nowrap text-sm font-medium text-gray-900">{room.name}</td>
                <td className="py-4 px-6 whitespace-nowrap text-sm text-gray-700">{room.openAt} - {room.closeAt}</td>
                <td className="py-4 px-6 whitespace-nowrap text-sm text-gray-700">{room.isActive ? '✅' : '❌'}</td>
                <td className="py-4 px-6 whitespace-nowrap text-sm text-gray-700">{room.seats?.length || 0}</td>
                <td className="py-4 px-6 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex space-x-2">
                    <Button variant="secondary" size="sm" onClick={() => handleEditRoom(room)} disabled={actionLoading}>수정</Button>
                    <Button variant="danger" size="sm" onClick={() => handleDeleteRoom(room.id)} disabled={actionLoading}>삭제</Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal isOpen={isFormModalOpen} onClose={() => setIsFormModalOpen(false)} title={currentRoom ? '열람실 수정' : '새 열람실 추가'}>
        <RoomForm
          room={currentRoom || undefined}
          onSave={handleSaveRoom}
          onCancel={() => setIsFormModalOpen(false)}
          loading={actionLoading}
          error={actionError}
        />
      </Modal>
    </div>
  );
};

// --- Seat Management Component ---
interface SeatFormProps {
  seat?: Seat;
  onSave: (seatData: Omit<Seat, 'id'>) => void;
  onCancel: () => void;
  loading: boolean;
  error: string | null;
  rooms: Room[];
}

const SeatForm: React.FC<SeatFormProps> = ({ seat, onSave, onCancel, loading, error, rooms }) => {
  const [roomId, setRoomId] = useState(seat?.roomId || '');
  const [code, setCode] = useState(seat?.code || '');
  const [isActive, setIsActive] = useState(seat?.isActive ?? true);

  useEffect(() => {
    if (seat) {
      setRoomId(seat.roomId);
      setCode(seat.code);
      setIsActive(seat.isActive);
    } else {
      // Set default room if rooms are available and it's a new seat
      if (rooms.length > 0 && !roomId) {
        setRoomId(rooms[0].id);
      }
    }
  }, [seat, rooms, roomId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ roomId, code, isActive });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">{error}</div>}
      <div>
        <label htmlFor="seatRoomId" className="block text-sm font-medium text-gray-700">열람실</label>
        <select
          id="seatRoomId"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2"
          value={roomId}
          onChange={(e) => setRoomId(e.target.value)}
          required
          disabled={!!seat && !loading} // Disable room change for existing seats to simplify for MVP
        >
          <option value="">열람실 선택</option>
          {rooms.map(room => (
            <option key={room.id} value={room.id}>{room.name}</option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="seatCode" className="block text-sm font-medium text-gray-700">좌석 코드</label>
        <input
          type="text"
          id="seatCode"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          required
        />
      </div>
      <div className="flex items-center">
        <input
          id="seatIsActive"
          name="seatIsActive"
          type="checkbox"
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          checked={isActive}
          onChange={(e) => setIsActive(e.target.checked)}
        />
        <label htmlFor="seatIsActive" className="ml-2 block text-sm text-gray-900">활성화</label>
      </div>
      <div className="flex justify-end space-x-3">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={loading}>
          취소
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? <LoadingSpinner /> : (seat ? '수정' : '추가')}
        </Button>
      </div>
    </form>
  );
};


const SeatManagement: React.FC = () => {
  const [seats, setSeats] = useState<Seat[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]); // To provide room options
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState<boolean>(false);
  const [currentSeat, setCurrentSeat] = useState<Seat | null>(null);
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const fetchSeatsAndRooms = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const fetchedRooms = await adminFetchRooms();
      setRooms(fetchedRooms);
      const fetchedSeats = await adminFetchSeats();
      // Attach room name to seats for display
      const seatsWithRoom = fetchedSeats.map(seat => ({
        ...seat,
        room: fetchedRooms.find(r => r.id === seat.roomId)
      }));
      setSeats(seatsWithRoom);
    } catch (err) {
      setError('좌석 및 열람실 목록을 불러오는 데 실패했습니다.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSeatsAndRooms();
  }, [fetchSeatsAndRooms]);

  const handleAddSeat = () => {
    setCurrentSeat(null);
    setActionError(null);
    setIsFormModalOpen(true);
  };

  const handleEditSeat = (seat: Seat) => {
    setCurrentSeat(seat);
    setActionError(null);
    setIsFormModalOpen(true);
  };

  const handleSaveSeat = async (seatData: Omit<Seat, 'id'>) => {
    setActionLoading(true);
    setActionError(null);
    try {
      if (currentSeat) {
        await adminUpdateSeat(currentSeat.id, seatData);
      } else {
        await adminCreateSeat(seatData);
      }
      await fetchSeatsAndRooms(); // Refresh list
      setIsFormModalOpen(false);
    } catch (err: any) {
      setActionError(err.message || '좌석 저장 중 오류가 발생했습니다.');
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteSeat = async (seatId: string) => {
    if (!window.confirm('정말로 이 좌석을 삭제하시겠습니까? 관련된 예약도 삭제됩니다.')) return;
    setActionLoading(true);
    setActionError(null);
    try {
      await adminDeleteSeat(seatId);
      await fetchSeatsAndRooms(); // Refresh list
    } catch (err: any) {
      setActionError(err.message || '좌석 삭제 중 오류가 발생했습니다.');
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-8 bg-white shadow-xl rounded-lg">
      <h2 className="text-3xl font-bold text-gray-900 mb-6 flex justify-between items-center">
        좌석 관리
        <Button onClick={handleAddSeat}>좌석 추가</Button>
      </h2>

      {loading && <LoadingSpinner />}
      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">{error}</div>}
      {actionError && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">{actionError}</div>}

      {!loading && seats.length === 0 && <p className="text-gray-600">등록된 좌석이 없습니다.</p>}

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200 rounded-lg">
          <thead className="bg-gray-50">
            <tr>
              <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">열람실</th>
              <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">좌석 코드</th>
              <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">활성화</th>
              <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">관리</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {seats.map((seat) => (
              <tr key={seat.id} className="hover:bg-gray-50">
                <td className="py-4 px-6 whitespace-nowrap text-sm font-medium text-gray-900">{seat.room?.name || '알 수 없음'}</td>
                <td className="py-4 px-6 whitespace-nowrap text-sm text-gray-700">{seat.code}</td>
                <td className="py-4 px-6 whitespace-nowrap text-sm text-gray-700">{seat.isActive ? '✅' : '❌'}</td>
                <td className="py-4 px-6 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex space-x-2">
                    <Button variant="secondary" size="sm" onClick={() => handleEditSeat(seat)} disabled={actionLoading}>수정</Button>
                    <Button variant="danger" size="sm" onClick={() => handleDeleteSeat(seat.id)} disabled={actionLoading}>삭제</Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal isOpen={isFormModalOpen} onClose={() => setIsFormModalOpen(false)} title={currentSeat ? '좌석 수정' : '새 좌석 추가'}>
        <SeatForm
          seat={currentSeat || undefined}
          onSave={handleSaveSeat}
          onCancel={() => setIsFormModalOpen(false)}
          loading={actionLoading}
          error={actionError}
          rooms={rooms}
        />
      </Modal>
    </div>
  );
};


// --- Reservation Management Component ---
const ReservationManagement: React.FC = () => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const fetchReservations = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminFetchAllReservations();
      setReservations(data);
    } catch (err) {
      setError('예약 목록을 불러오는 데 실패했습니다.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReservations();
  }, [fetchReservations]);

  const handleCancelReservation = async (reservationId: string) => {
    if (!window.confirm('정말로 이 예약을 취소하시겠습니까?')) return;
    setActionLoading(true);
    setActionError(null);
    try {
      await adminCancelReservation(reservationId);
      await fetchReservations(); // Refresh list
    } catch (err: any) {
      setActionError(err.message || '예약 취소 중 오류가 발생했습니다.');
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-8 bg-white shadow-xl rounded-lg">
      <h2 className="text-3xl font-bold text-gray-900 mb-6">예약 관리</h2>

      {loading && <LoadingSpinner />}
      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">{error}</div>}
      {actionError && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">{actionError}</div>}

      {!loading && reservations.length === 0 && <p className="text-gray-600">예약 내역이 없습니다.</p>}

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200 rounded-lg">
          <thead className="bg-gray-50">
            <tr>
              <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">사용자</th>
              <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">열람실</th>
              <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">좌석</th>
              <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">날짜</th>
              <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">시간</th>
              <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">상태</th>
              <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">관리</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {reservations.map((res) => (
              <tr key={res.id} className="hover:bg-gray-50">
                <td className="py-4 px-6 whitespace-nowrap text-sm font-medium text-gray-900">{res.user?.name || res.user?.email || '알 수 없음'}</td>
                <td className="py-4 px-6 whitespace-nowrap text-sm text-gray-700">{res.seat?.room?.name || '알 수 없음'}</td>
                <td className="py-4 px-6 whitespace-nowrap text-sm text-gray-700">{res.seat?.code || '알 수 없음'}</td>
                <td className="py-4 px-6 whitespace-nowrap text-sm text-gray-700">{res.date}</td>
                <td className="py-4 px-6 whitespace-nowrap text-sm text-gray-700">{res.startTime} - {res.endTime}</td>
                <td className="py-4 px-6 whitespace-nowrap text-sm">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    res.status === ReservationStatus.ACTIVE ? 'bg-green-100 text-green-800' :
                    res.status === ReservationStatus.CANCELLED ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {res.status === ReservationStatus.ACTIVE ? '활성' : (res.status === ReservationStatus.CANCELLED ? '취소됨' : res.status)}
                  </span>
                </td>
                <td className="py-4 px-6 whitespace-nowrap text-right text-sm font-medium">
                  {res.status === ReservationStatus.ACTIVE && (
                    <Button variant="danger" size="sm" onClick={() => handleCancelReservation(res.id)} disabled={actionLoading}>취소</Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};


const AdminDashboard: React.FC = () => {
  const auth = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState<'rooms' | 'seats' | 'reservations'>('rooms');

  if (!auth.isLoggedIn || !auth.isAdmin) {
    return (
      <div className="container mx-auto p-4 md:p-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">접근 권한 없음</h1>
        <p className="text-lg text-gray-700 mb-6">이 페이지는 관리자만 접근할 수 있습니다.</p>
        <Button onClick={() => auth.login({ id: `admin-${Date.now()}`, email: `admin${Date.now()}@example.com`, name: `Admin ${Date.now()}`, role: 'admin', createdAt: new Date().toISOString() })}>
          관리자로 로그인하기
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
    <div className="container mx-auto p-4 md:p-8 bg-gray-50 min-h-screen">
      <h1 className="text-4xl font-extrabold text-gray-900 mb-8 text-center">관리자 대시보드</h1>

      <div className="mb-8 flex justify-center border-b border-gray-200">
        <button
          onClick={() => setActiveTab('rooms')}
          className={`py-3 px-6 text-lg font-medium ${
            activeTab === 'rooms'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          열람실
        </button>
        <button
          onClick={() => setActiveTab('seats')}
          className={`py-3 px-6 text-lg font-medium ${
            activeTab === 'seats'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          좌석
        </button>
        <button
          onClick={() => setActiveTab('reservations')}
          className={`py-3 px-6 text-lg font-medium ${
            activeTab === 'reservations'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          예약
        </button>
      </div>

      <div className="space-y-8">
        {activeTab === 'rooms' && <RoomManagement />}
        {activeTab === 'seats' && <SeatManagement />}
        {activeTab === 'reservations' && <ReservationManagement />}
      </div>
    </div>
  );
};

export default AdminDashboard;
