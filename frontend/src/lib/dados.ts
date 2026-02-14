import { api, ApiFilme, ApiSessao, ApiSala } from './api';
import { PLACEHOLDER_IMAGE } from './constants';

export interface Filme {
  id: string;
  titulo: string;
  descricao: string;
  duracao: number;
  classificacao: string;
  genero: string;
  imagem: string;
  emCartaz: boolean;
  dataLancamento: string;
}

export interface Sala {
  id: string;
  nome: string;
  capacidade: number;
  tipo: 'normal' | 'imax' | '3d' | 'vip' | 'convencional' | 'XD' | 'XD3D' | 'Prime';
}

export interface Sessao {
  id: string;
  filmeId: string;
  salaId: string;
  horario: string;
  data: string;
  preco: number;
  filme?: Filme;
  sala?: Sala;
}

export interface Reserva {
  id: string;
  sessaoId: string;
  nomeCliente: string;
  emailCliente: string;
  poltronas: string[];
  total: number;
  status: 'pendente' | 'confirmada' | 'cancelada';
  createdAt: string;
}

export interface Poltrona {
  id: string;
  fileira: string;
  numero: number;
  status: 'disponivel' | 'reservada' | 'selecionada';
}

export interface SessaoComPoltronas extends Sessao {
  poltronas: Poltrona[];
}

const mapFilmeFromApi = (f: ApiFilme): Filme => ({
  id: f.id,
  titulo: f.title,
  descricao: f.description,
  duracao: f.duration,
  classificacao: f.classification,
  genero: f.genre,
  imagem: f.posterUrl || PLACEHOLDER_IMAGE,
  emCartaz: f.showing,
  dataLancamento: f.releaseDate,
});

const mapSalaFromApi = (s: ApiSala): Sala => {
  let tipo: Sala['tipo'] = 'normal';
  if (s.isIMAX) tipo = 'XD';
  else if (s.is3D) tipo = '3d';
  else if (s.hasSoundDolby) tipo = 'vip';
  
  return {
    id: s.id,
    nome: s.name,
    capacidade: s.rows * s.seatsPerRow,
    tipo,
  };
};

const mapSessaoFromApi = (s: ApiSessao): Sessao => {
  const startTime = new Date(s.startTime);
  return {
    id: s.id,
    filmeId: s.movieId,
    salaId: s.salaId,
    horario: startTime.toTimeString().slice(0, 5),
    data: startTime.toISOString().split('T')[0],
    preco: s.price,
    filme: s.movie ? mapFilmeFromApi(s.movie) : undefined,
    sala: s.sala ? mapSalaFromApi(s.sala) : undefined,
  };
};

export const getFilmesEmCartaz = async (): Promise<Filme[]> => {
  const filmes = await api.getFilmes();
  return filmes.map(mapFilmeFromApi);
};

export const getFilmeById = async (id: string): Promise<Filme | undefined> => {
  try {
    const filme = await api.getFilmeById(id);
    return filme ? mapFilmeFromApi(filme) : undefined;
  } catch {
    return undefined;
  }
};

export const getSessoesByFilme = async (filmeId: string): Promise<Sessao[]> => {
  const sessoes = await api.getSessoesByFilme(filmeId);
  return sessoes.map(mapSessaoFromApi);
};

export const getSessaoById = async (id: string): Promise<Sessao | undefined> => {
  try {
    const sessao = await api.getSessaoById(id);
    return sessao ? mapSessaoFromApi(sessao) : undefined;
  } catch {
    return undefined;
  }
};

export const getSalaById = async (id: string): Promise<Sala | undefined> => {
  try {
    const salas = await api.getSalas();
    const sala = salas.find(s => s.id === id);
    return sala ? mapSalaFromApi(sala) : undefined;
  } catch {
    return undefined;
  }
};

export const gerarPoltronasMock = async (salaId: string, capacidade: number): Promise<Poltrona[]> => {
  // Always use mock data for demo purposes
  const poltronas: Poltrona[] = [];
  const fileiras = 'ABCDEFGHIJKLMNOP'.split('');
  let id = 1;
  const numFileiras = Math.ceil(capacidade / 14);
  
  for (let r = 0; r < numFileiras; r++) {
    for (let n = 1; n <= 14; n++) {
      poltronas.push({
        id: String(id++),
        fileira: fileiras[r] || 'A',
        numero: n,
        status: Math.random() > 0.3 ? 'disponivel' : 'reservada',
      });
    }
  }
  return poltronas;
};

export const getAllSessoes = async (): Promise<Sessao[]> => {
  const sessoes = await api.getSessoes();
  return sessoes.map(mapSessaoFromApi);
};

export const getSalas = async (): Promise<Sala[]> => {
  const salas = await api.getSalas();
  return salas.map(mapSalaFromApi);
};
