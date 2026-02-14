/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { LoggerModule } from 'nestjs-pino';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';

import { ContaModule } from './modules/conta/conta.module';
import { CatalogoModule } from './modules/catalogo/catalogo.module';
import { SalaModule } from './modules/sala/sala.module';
import { LojaModule } from './modules/loja/loja.module';
import { IngressoModule } from './modules/ingresso/ingresso.module';
import { PagamentoModule } from './modules/pagamento/pagamento.module';
import { DescontoModule } from './modules/desconto/desconto.module';
import { ValidacaoModule } from './modules/validacao/validacao.module';
import { PacoteModule } from './modules/pacote/pacote.module';
import { EventBusModule } from './common/events/event-bus.module';

@Module({
  imports: [
    LoggerModule.forRoot({
      pinoHttp: {
        name: 'cinema-api',
        transport: process.env.NODE_ENV !== 'production' ? { target: 'pino-pretty' } : undefined,
        autoLogging: {
          ignore: (req) => req.url === '/health',
        },
      },
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    EventEmitterModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      autoLoadEntities: true,
      synchronize: false,
    }),
    PrismaModule,
    EventBusModule,
    ContaModule,
    CatalogoModule,
    SalaModule,
    LojaModule,
    IngressoModule,
    PagamentoModule,
    DescontoModule,
    ValidacaoModule,
    PacoteModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
