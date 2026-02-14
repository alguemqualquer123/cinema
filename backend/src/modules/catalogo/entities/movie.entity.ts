import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Session } from './session.entity';

export { Session } from './session.entity';

@Entity('movies')
export class Movie {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column('text')
  description: string;

  @Column()
  duration: number;

  @Column()
  genre: string;

  @Column({ nullable: true })
  posterUrl: string;

  @Column({ nullable: true })
  trailerUrl: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: 'lancamento' })
  classification: string;

  @Column({ type: 'date', nullable: true })
  releaseDate: Date;

  @Column({ default: true })
  showing: boolean;

  @OneToMany(() => Session, (session) => session.movie)
  sessions: Session[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
