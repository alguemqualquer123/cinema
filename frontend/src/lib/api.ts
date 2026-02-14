import axios from 'axios';

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface ApiFilme {
  id: string;
  title: string;
  description: string;
  duration: number;
  genre: string;
  posterUrl: string;
  classification: string;
  releaseDate: string;
  showing: boolean;
}

export interface ApiSala {
  id: string;
  name: string;
  rows: number;
  seatsPerRow: number;
  is3D: boolean;
  isIMAX: boolean;
  hasSoundDolby: boolean;
}

export interface ApiSessao {
  id: string;
  movieId: string;
  salaId: string;
  startTime: string;
  endTime: string;
  price: number;
  movie?: ApiFilme;
  sala?: ApiSala;
}

export interface ApiOrder {
  id: string;
  total: number;
  status: string;
  seatIds: string[];
  sessionId: string;
  createdAt: string;
}

export interface ApiTicket {
  id: string;
  qrCode: string;
  seatInfo: string;
  price: number;
  status: string;
  createdAt: string;
}

export const api = {
  async getFilmes(): Promise<ApiFilme[]> {
    try {
      const response = await apiClient.get<ApiFilme[]>('/catalog/movies');
      return response.data;
    } catch {
      return [];
    }
  },

  async getFilmeById(id: string): Promise<ApiFilme | null> {
    try {
      const response = await apiClient.get<ApiFilme>(`/catalog/movies/${id}`);
      return response.data;
    } catch {
      return null;
    }
  },

  async getSessoes(): Promise<ApiSessao[]> {
    try {
      const response = await apiClient.get<ApiSessao[]>('/catalog/sessions');
      return response.data;
    } catch {
      return [];
    }
  },

  async getSessaoById(id: string): Promise<ApiSessao | null> {
    try {
      const response = await apiClient.get<ApiSessao>(`/catalog/sessions/${id}`);
      return response.data;
    } catch {
      return null;
    }
  },

  async getSessoesByFilme(filmeId: string): Promise<ApiSessao[]> {
    try {
      const response = await apiClient.get<ApiSessao[]>(
        `/catalog/sessions/movie/${filmeId}`
      );
      return response.data;
    } catch {
      return [];
    }
  },

  async getSalas(): Promise<ApiSala[]> {
    try {
      const response = await apiClient.get<ApiSala[]>('/catalog/salas');
      return response.data;
    } catch {
      return [];
    }
  },

  async getSessaoWithSeats(id: string) {
    try {
      const response = await apiClient.get(`/catalog/sessions/${id}/seats`);
      return response.data;
    } catch {
      return null;
    }
  },

  async createOrder(sessionId: string, seatIds: string[], token: string) {
    const response = await apiClient.post('/orders', { sessionId, seatIds }, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  async confirmPayment(orderId: string, token: string) {
    const response = await apiClient.post(`/payments/confirm/${orderId}`, {}, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  async getMyOrders(token: string) {
    const response = await apiClient.get('/orders/my-orders', {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  async getMyTickets(token: string) {
    const response = await apiClient.get('/tickets/my-tickets', {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },
};
