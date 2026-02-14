/* eslint-disable prettier/prettier */
import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Movie } from './entities/movie.entity';
import { Session } from './entities/session.entity';
import { Sala } from '../sala/entities/sala.entity';
import { Seat, SeatStatus } from '../sala/entities/seat.entity';

const MOVIES_DATA = [
  { title: 'Duna: parte Dois', description: 'Paul Atreides se une a Chani e aos Fremen em uma guerra de vingança.', duration: 166, genre: 'Ficção Científica', posterUrl: 'https://image.tmdb.org/t/p/w500/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg', classification: '14 anos', releaseDate: '2024-02-28', showing: true },
  { title: 'Oppenheimer', description: 'A história do científico americano J. Robert Oppenheimer e seu papel no desenvolvimento da bomba atômica.', duration: 180, genre: 'Drama', posterUrl: 'https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg', classification: '16 anos', releaseDate: '2023-07-20', showing: true },
  { title: 'Batman', description: 'Quando um assassino sádico ameaça Gotham City, Batman precisa enfrenta-lo.', duration: 176, genre: 'Ação', posterUrl: 'https://image.tmdb.org/t/p/w500/74xTEgt7R36Fvber9r3jtvyqZaC.jpg', classification: '14 anos', releaseDate: '2022-03-03', showing: true },
  { title: 'Avatar: O Caminho da Água', description: 'Jake Sully vive com sua família em Pandora e precisa proteger seu lar.', duration: 192, genre: 'Ficção Científica', posterUrl: 'https://image.tmdb.org/t/p/w500/t6HIqrRAclMCA60NsSmeqe9RmNV.jpg', classification: '12 anos', releaseDate: '2022-12-15', showing: true },
  { title: 'Matrix Resurrections', description: 'Neo precisa voltar ao mundo da Matrix para enfrentar uma nova ameaça.', duration: 148, genre: 'Ficção Científica', posterUrl: 'https://image.tmdb.org/t/p/w500/8kOWDBK6XlPUzckuHDo3wwVRFwt.jpg', classification: '14 anos', releaseDate: '2021-12-22', showing: false },
  { title: 'Top Gun: Maverick', description: 'Maverick deve treinar um grupo de jovens pilotos para uma missão impossível.', duration: 131, genre: 'Ação', posterUrl: 'https://image.tmdb.org/t/p/w500/62HCnUTziyWcpDaBO2i1DG35MPv.jpg', classification: '12 anos', releaseDate: '2022-05-25', showing: true },
  { title: 'Interestelar', description: 'Exploradores espaciais viajam através de um buraco de minhoca em busca de um novo lar.', duration: 169, genre: 'Ficção Científica', posterUrl: 'https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg', classification: '12 anos', releaseDate: '2014-11-07', showing: true },
  { title: 'O Poderoso Chefão', description: 'A história da família Corleone, uma das mais poderosas famílias da máfia italiana.', duration: 175, genre: 'Drama', posterUrl: 'https://image.tmdb.org/t/p/w500/3bhkrj58Vtu7enYsRolD1fZdja1.jpg', classification: '14 anos', releaseDate: '1972-03-14', showing: true },
  { title: 'Vingadores: Ultimato', description: 'Os Vingadores se reúnem para reverter os danos causados por Thanos.', duration: 181, genre: 'Ação', posterUrl: 'https://image.tmdb.org/t/p/w500/or06FN3Dka5tukK1e9sl16pB3iy.jpg', classification: '12 anos', releaseDate: '2019-04-25', showing: true },
  { title: 'Homem-Aranha: Através do Aranha-Verso', description: 'Miles Morales embarca em uma aventura através do multiverso.', duration: 140, genre: 'Animação', posterUrl: 'https://image.tmdb.org/t/p/w500/sv1xJUazXeYqALzczSZ3O6nkH75.jpg', classification: '10 anos', releaseDate: '2023-06-21', showing: true },
  { title: 'Barbie', description: 'Barbie e Ken estão passando por uma crise de identidade na terra perfeita da Barbie.', duration: 114, genre: 'Comédia', posterUrl: 'https://image.tmdb.org/t/p/w500/iuFNMS8U5cb6xfzi51Dbkovj7vM.jpg', classification: '12 anos', releaseDate: '2023-07-20', showing: true },
  { title: 'John Wick 4: Baba Yaga', description: 'John Wick enfrenta os maiores assassinos do mundo em uma jornada global.', duration: 169, genre: 'Ação', posterUrl: 'https://image.tmdb.org/t/p/w500/vZloFAK7NmvMGKE7VkF5UHaz0I.jpg', classification: '16 anos', releaseDate: '2023-03-24', showing: true },
  { title: 'Harry Potter e a Pedra Filosofal', description: 'Um jovem bruxo descobre seu destino no mundo mágico de Hogwarts.', duration: 152, genre: 'Fantasia', posterUrl: 'https://image.tmdb.org/t/p/w500/wuMc08IPKEixf0c7wzyIyXPFLqZ.jpg', classification: '10 anos', releaseDate: '2001-11-15', showing: true },
  { title: 'O Senhor dos Anéis: A Sociedade do Anel', description: 'Uma jornada épica para destruir o Um Anel e salvar a Terra Média.', duration: 178, genre: 'Fantasia', posterUrl: 'https://image.tmdb.org/t/p/w500/6oom5QYQ2yQTMJIbnvbkBL9cHo6.jpg', classification: '12 anos', releaseDate: '2001-12-19', showing: true },
  { title: 'Titanic', description: 'Um romance histórico a bordo do lendário transatlântico Titanic.', duration: 194, genre: 'Romance', posterUrl: 'https://image.tmdb.org/t/p/w500/2TlN1qCTiNJ041oKCGwqPmMlQV.jpg', classification: '12 anos', releaseDate: '1997-11-19', showing: true },
  { title: 'Forrest Gump', description: 'A vida extraordinária de um homem comum que vive momentos históricos.', duration: 142, genre: 'Drama', posterUrl: 'https://image.tmdb.org/t/p/w500/arw2vcBveWOVZr6pxd9XTd1TdQa.jpg', classification: '12 anos', releaseDate: '1994-07-06', showing: true },
  { title: 'O Rei Leão', description: 'A história de Simba, um jovem leão que deve reclamar seu lugar como rei.', duration: 88, genre: 'Animação', posterUrl: 'https://image.tmdb.org/t/p/w500/sKCr78MXSLixwmZ8DyJLrpMsdP.jpg', classification: 'Livre', releaseDate: '1994-06-23', showing: true },
  { title: 'Jurassic Park', description: 'Um parque temático com dinossauros geneticamente modificados se torna caos.', duration: 127, genre: 'Ficção Científica', posterUrl: 'https://image.tmdb.org/t/p/w500/oU7Ohr2fJhiXKkMl2pDFUdTl2kK.jpg', classification: '10 anos', releaseDate: '1993-06-11', showing: true },
  { title: 'Toy Story', description: 'Os brinquedos de Andy ganham vida quando humanos não estão por perto.', duration: 81, genre: 'Animação', posterUrl: 'https://image.tmdb.org/t/p/w500/uXDfjJbdP4ijW5hWSBrPrlKpxab.jpg', classification: 'Livre', releaseDate: '1995-11-22', showing: true },
  { title: 'Gluon', description: 'Um filme de ficção científica sobre um cientista que cria uma máquina do tempo.', duration: 108, genre: 'Ficção Científica', posterUrl: 'https://image.tmdb.org/t/p/w500/mKXPwunoC3W3YFnKyOlD8yX3Cnl.jpg', classification: '12 anos', releaseDate: '2024-01-15', showing: true },
];

const SALAS_DATA = [
  { name: 'Sala 1', rows: 10, seatsPerRow: 14, is3D: false, isIMAX: false, hasSoundDolby: false },
  { name: 'Sala 2 (3D)', rows: 10, seatsPerRow: 14, is3D: true, isIMAX: false, hasSoundDolby: false },
  { name: 'Sala 3 (XD)', rows: 14, seatsPerRow: 20, is3D: false, isIMAX: true, hasSoundDolby: true },
  { name: 'Sala 4 (Prime)', rows: 6, seatsPerRow: 8, is3D: false, isIMAX: false, hasSoundDolby: true },
  { name: 'Sala 5 (XD 3D)', rows: 14, seatsPerRow: 22, is3D: true, isIMAX: true, hasSoundDolby: true },
  { name: 'Sala 6 (Macro XE)', rows: 16, seatsPerRow: 24, is3D: false, isIMAX: true, hasSoundDolby: true },
  { name: 'Sala 7 (VIP)', rows: 5, seatsPerRow: 10, is3D: false, isIMAX: false, hasSoundDolby: true },
];

@Injectable()
export class SeedService implements OnModuleInit {
  constructor(
    @InjectRepository(Movie)
    private movieRepository: Repository<Movie>,
    @InjectRepository(Sala)
    private salaRepository: Repository<Sala>,
    @InjectRepository(Session)
    private sessionRepository: Repository<Session>,
    @InjectRepository(Seat)
    private seatRepository: Repository<Seat>,
  ) { }

  async onModuleInit() {
    await this.seed();
  }

  async seed() {
    const moviesCount = await this.movieRepository.count();
    if (moviesCount > 0) {
      console.log('Database already seeded');
      return;
    }

    console.log('Seeding database...');

    const salas = await this.salaRepository.save(SALAS_DATA.map(s => this.salaRepository.create(s)));

    const movies = await this.movieRepository.save(
      MOVIES_DATA.map(m => this.movieRepository.create({ ...m, isActive: true }))
    );

    const horarios = ['14:00', '16:30', '19:00', '21:30'];
    const sessions: Partial<Session>[] = [];
    const hoje = new Date();

    movies.filter(m => m.showing).forEach((filme) => {
      for (let d = 0; d <= 7; d++) {
        const data = new Date(hoje);
        data.setDate(data.getDate() + d);

        horarios.forEach((horario, idx) => {
          const sala = salas[idx % salas.length];
          const [hora, minuto] = horario.split(':').map(Number);
          const startTime = new Date(data);
          startTime.setHours(hora, minuto, 0, 0);

          const endTime = new Date(startTime);
          endTime.setMinutes(endTime.getMinutes() + filme.duration);

          const preco = sala.isIMAX ? 50 : sala.is3D ? 40 : sala.hasSoundDolby ? 35 : 30;

          sessions.push({
            movieId: filme.id,
            salaId: sala.id,
            startTime,
            endTime,
            price: preco,
            isActive: true,
          });
        });
      }
    });

    await this.sessionRepository.save(sessions);

    for (const sala of salas) {
      const seats: Partial<Seat>[] = [];
      const fileiras = 'ABCDEFGHIJKLMNOP'.split('');

      for (let r = 0; r < sala.rows; r++) {
        for (let s = 1; s <= sala.seatsPerRow; s++) {
          const isAvailable = Math.random() > 0.2;
          seats.push({
            salaId: sala.id,
            row: fileiras[r],
            number: s,
            status: isAvailable ? SeatStatus.AVAILABLE : SeatStatus.RESERVED,
          });
        }
      }

      await this.seatRepository.save(seats);
    }

    console.log('Database seeded successfully!');
  }
}
