import { User, Room, Reservation, Seat, RoomAvailability, ReservationStatus, TimeSlot } from '../types';

// Utility to format date to YYYY-MM-DD
const formatDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const today = formatDate(new Date());

let currentUser: User | null = null;
let mockReservations: Reservation[] = [];
let mockRooms: Room[] = [
  { id: 'room-1', name: '열람실 1', isActive: true, openAt: '09:00', closeAt: '22:00', seats: [] },
  { id: 'room-2', name: '열람실 2', isActive: true, openAt: '09:00', closeAt: '20:00', seats: [] },
  { id: 'room-3', name: '스터디룸', isActive: true, openAt: '10:00', closeAt: '18:00', seats: [] },
];

let mockSeats: Seat[] = [];
for (let i = 1; i <= 10; i++) {
  mockSeats.push({ id: `seat-1-${i}`, roomId: 'room-1', code: `A${i}`, isActive: true });
  mockSeats.push({ id: `seat-2-${i}`, roomId: 'room-2', code: `B${i}`, isActive: true });
}
for (let i = 1; i <= 5; i++) {
  mockSeats.push({ id: `seat-3-${i}`, roomId: 'room-3', code: `C${i}`, isActive: true });
}

// Map seats to rooms
mockRooms = mockRooms.map(room => ({
  ...room,
  seats: mockSeats.filter(seat => seat.roomId === room.id),
}));

export const getAuthStatus = async (): Promise<User | null> => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(currentUser);
    }, 100);
  });
};

export const loginUser = async (email: string, role: 'user' | 'admin'): Promise<User> => {
  return new Promise(resolve => {
    setTimeout(() => {
      currentUser = {
        id: `user-${Date.now()}`,
        email,
        name: email.split('@')[0],
        role,
        createdAt: new Date().toISOString(),
      };
      resolve(currentUser);
    }, 500);
  });
};

export const logoutUser = async (): Promise<void> => {
  return new Promise(resolve => {
    setTimeout(() => {
      currentUser = null;
      resolve();
    }, 100);
  });
};

export const fetchRoomsToday = async (): Promise<RoomAvailability[]> => {
  return new Promise(resolve => {
    setTimeout(() => {
      const roomAvailabilities: RoomAvailability[] = mockRooms
        .filter(room => room.isActive)
        .map(room => {
          const timeSlots: TimeSlot[] = [];
          const openHour = parseInt(room.openAt?.split(':')[0] || '9');
          const closeHour = parseInt(room.closeAt?.split(':')[0] || '22');

          for (let h = openHour; h < closeHour; h++) {
            const time = `${h.toString().padStart(2, '0')}:00`;
            const nextHour = `${(h + 1).toString().padStart(2, '0')}:00`;
            const currentHourReservations = mockReservations.filter(
              res =>
                res.seat &&
                res.seat.roomId === room.id &&
                res.date === today &&
                res.startTime === time &&
                res.status === ReservationStatus.ACTIVE
            );
            const availableSeats = room.seats.length - currentHourReservations.length;
            timeSlots.push({ time, availableSeats: Math.max(0, availableSeats) });
          }
          return { room, timeSlots };
        });
      resolve(roomAvailabilities);
    }, 500);
  });
};

export const fetchMyReservation = async (userId: string): Promise<Reservation | null> => {
  return new Promise(resolve => {
    setTimeout(() => {
      const userReservation = mockReservations.find(
        res => res.userId === userId && res.date === today && res.status === ReservationStatus.ACTIVE
      );
      if (userReservation) {
        userReservation.seat = mockSeats.find(s => s.id === userReservation.seatId);
        userReservation.user = currentUser || undefined;
      }
      resolve(userReservation || null);
    }, 500);
  });
};

export const createReservation = async (
  userId: string,
  seatId: string,
  startTime: string,
): Promise<Reservation> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // Check if user already has a reservation for today
      const existingUserReservation = mockReservations.some(
        res => res.userId === userId && res.date === today && res.status === ReservationStatus.ACTIVE
      );
      if (existingUserReservation) {
        return reject(new Error('You already have a reservation for today.'));
      }

      // Check if the seat is already reserved for this time
      const existingSeatReservation = mockReservations.some(
        res => res.seatId === seatId && res.date === today && res.startTime === startTime && res.status === ReservationStatus.ACTIVE
      );
      if (existingSeatReservation) {
        return reject(new Error('This seat is already reserved for the selected time.'));
      }

      const selectedSeat = mockSeats.find(s => s.id === seatId);
      if (!selectedSeat) {
        return reject(new Error('Selected seat not found.'));
      }
      const room = mockRooms.find(r => r.id === selectedSeat.roomId);
      if (!room) {
        return reject(new Error('Room for selected seat not found.'));
      }

      const endTime = `${(parseInt(startTime.split(':')[0]) + 1).toString().padStart(2, '0')}:00`;

      const newReservation: Reservation = {
        id: `res-${Date.now()}`,
        userId,
        seatId,
        date: today,
        startTime,
        endTime,
        status: ReservationStatus.ACTIVE,
        createdAt: new Date().toISOString(),
        seat: selectedSeat,
        user: currentUser || undefined,
      };
      mockReservations.push(newReservation);
      resolve(newReservation);
    }, 1000);
  });
};

// Admin API calls
export const adminFetchRooms = async (): Promise<Room[]> => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(mockRooms.map(room => ({ ...room, totalSeats: room.seats.length })));
    }, 500);
  });
};

export const adminCreateRoom = async (roomData: Omit<Room, 'id' | 'seats'>): Promise<Room> => {
  return new Promise(resolve => {
    setTimeout(() => {
      const newRoom: Room = {
        id: `room-${Date.now()}`,
        ...roomData,
        seats: [],
      };
      mockRooms.push(newRoom);
      resolve(newRoom);
    }, 500);
  });
};

export const adminUpdateRoom = async (roomId: string, roomData: Partial<Room>): Promise<Room> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const index = mockRooms.findIndex(r => r.id === roomId);
      if (index > -1) {
        mockRooms[index] = { ...mockRooms[index], ...roomData };
        resolve(mockRooms[index]);
      } else {
        reject(new Error('Room not found'));
      }
    }, 500);
  });
};

export const adminDeleteRoom = async (roomId: string): Promise<void> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      mockRooms = mockRooms.filter(r => r.id !== roomId);
      mockSeats = mockSeats.filter(s => s.roomId !== roomId); // Delete associated seats
      mockReservations = mockReservations.filter(r => {
        const seat = mockSeats.find(s => s.id === r.seatId);
        return seat ? seat.roomId !== roomId : true; // Keep if seat doesn't belong to this room
      });
      resolve();
    }, 500);
  });
};


export const adminFetchSeats = async (): Promise<Seat[]> => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(mockSeats);
    }, 500);
  });
};

export const adminCreateSeat = async (seatData: Omit<Seat, 'id'>): Promise<Seat> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (!mockRooms.some(r => r.id === seatData.roomId)) {
        return reject(new Error('Room not found for seat.'));
      }
      const newSeat: Seat = {
        id: `seat-${Date.now()}`,
        ...seatData,
      };
      mockSeats.push(newSeat);
      // Update room's seats array
      mockRooms = mockRooms.map(room =>
        room.id === seatData.roomId ? { ...room, seats: [...room.seats, newSeat] } : room
      );
      resolve(newSeat);
    }, 500);
  });
};

export const adminUpdateSeat = async (seatId: string, seatData: Partial<Seat>): Promise<Seat> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const index = mockSeats.findIndex(s => s.id === seatId);
      if (index > -1) {
        mockSeats[index] = { ...mockSeats[index], ...seatData };
        resolve(mockSeats[index]);
      } else {
        reject(new Error('Seat not found'));
      }
    }, 500);
  });
};

export const adminDeleteSeat = async (seatId: string): Promise<void> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      mockSeats = mockSeats.filter(s => s.id !== seatId);
      // Remove seat from room's seats array
      mockRooms = mockRooms.map(room => ({
        ...room,
        seats: room.seats.filter(s => s.id !== seatId)
      }));
      mockReservations = mockReservations.filter(r => r.seatId !== seatId); // Delete associated reservations
      resolve();
    }, 500);
  });
};

export const adminFetchAllReservations = async (): Promise<Reservation[]> => {
  return new Promise(resolve => {
    setTimeout(() => {
      const detailedReservations = mockReservations.map(res => {
        const seat = mockSeats.find(s => s.id === res.seatId);
        const room = seat ? mockRooms.find(r => r.id === seat.roomId) : undefined;
        // Explicitly type the mock user to match the User interface
        const user: User = { 
          id: res.userId, 
          email: `user${res.userId.substring(res.userId.length - 4)}@example.com`, 
          role: 'user', 
          createdAt: new Date().toISOString() 
        };
        return {
          ...res,
          seat: seat ? { ...seat, room } : undefined,
          user,
        };
      });
      resolve(detailedReservations);
    }, 500);
  });
};

export const adminCancelReservation = async (reservationId: string): Promise<Reservation> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const index = mockReservations.findIndex(r => r.id === reservationId);
      if (index > -1) {
        mockReservations[index].status = ReservationStatus.CANCELLED;
        resolve(mockReservations[index]);
      } else {
        reject(new Error('Reservation not found'));
      }
    }, 500);
  });
};

// This function will fetch available seats for a specific room and time slot
export const fetchAvailableSeatsForRoomAndTime = async (roomId: string, startTime: string): Promise<Seat[]> => {
  return new Promise(resolve => {
    setTimeout(() => {
      const room = mockRooms.find(r => r.id === roomId);
      if (!room) {
        resolve([]);
        return;
      }

      const reservedSeatIds = new Set(
        mockReservations
          .filter(res => res.date === today && res.startTime === startTime && res.status === ReservationStatus.ACTIVE)
          .map(res => res.seatId)
      );

      const availableSeats = room.seats.filter(seat => seat.isActive && !reservedSeatIds.has(seat.id));
      resolve(availableSeats);
    }, 300);
  });
};