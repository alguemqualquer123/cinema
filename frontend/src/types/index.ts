export interface Filme {
  id: number;
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
  id: number;
  nome: string;
  capacidade: number;
  tipo: 'normal' | 'imax' | '3d' | 'vip' | 'convencional' | 'XD' | 'XD3D' | 'Prime';
}

export interface Sessao {
  id: number;
  filmeId: number;
  salaId: number;
  horario: string;
  data: string;
  preco: number;
  filme?: Filme;
  sala?: Sala;
}

export interface Reserva {
  id: number;
  sessaoId: number;
  nomeCliente: string;
  emailCliente: string;
  poltronas: number[];
  total: number;
  status: 'pendente' | 'confirmada' | 'cancelada';
  createdAt: string;
}

export interface Poltrona {
  id: number;
  fileira: string;
  numero: number;
  status: 'disponivel' | 'reservada' | 'selecionada';
}

export interface SessaoComPoltronas extends Sessao {
  poltronas: Poltrona[];
}
