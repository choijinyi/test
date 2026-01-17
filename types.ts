export interface User {
  id: string;
  email: string;
  name?: string;
  photoUrl?: string;
  role: 'user' | 'admin';
  createdAt: string;
}

export interface Room {
  id: string;
  name: string;
  isActive: boolean;
  openAt?: string;
  closeAt?: string;
  totalSeats?: number;
  availableSeats?: number;
  seats: Seat[];
}

export interface Seat {
  id: string;
  roomId: string;
  code: string;
  isActive: boolean;
  room?: Room;
}

export interface Reservation {
  id: string;
  userId: string;
  seatId: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  status: 'active' | 'cancelled' | 'noshow';
  createdAt: string;
  user?: User;
  seat?: Seat;
}

export interface AuthContextType {
  user: User | null;
  isLoggedIn: boolean;
  login: (userData: User) => void;
  logout: () => void;
  isAdmin: boolean;
}

export interface TimeSlot {
  time: string; // HH:MM format
  availableSeats: number;
}

export interface RoomAvailability {
  room: Room;
  timeSlots: TimeSlot[];
}

export enum ReservationStatus {
  ACTIVE = 'active',
  CANCELLED = 'cancelled',
  NOSHOW = 'noshow',
}
