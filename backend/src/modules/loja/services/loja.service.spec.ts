import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LojaService } from './loja.service';
import { Order, OrderStatus } from '../entities/order.entity';
import { SalaService } from '../../sala/services/sala.service';
import { SessionService } from '../../catalogo/services/movie.service';
import { DescontoService } from '../../desconto/services/desconto.service';
import { EventBusService } from '../../../common/events/event-bus.service';
import { PacoteService } from '../../pacote/services/pacote.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('LojaService', () => {
  let service: LojaService;
  let orderRepository: Repository<Order>;

  const mockOrderRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockSalaService = {
    reserveSeats: jest.fn(),
    releaseSeats: jest.fn(),
  };

  const mockSessionService = {
    findSessionById: jest.fn(),
  };

  const mockDescontoService = {
    applyDiscount: jest.fn(),
  };

  const mockPacoteService = {
    findProductById: jest.fn(),
    findPackageById: jest.fn(),
  };

  const mockEventBus = {
    publish: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LojaService,
        {
          provide: getRepositoryToken(Order),
          useValue: mockOrderRepository,
        },
        {
          provide: SalaService,
          useValue: mockSalaService,
        },
        {
          provide: SessionService,
          useValue: mockSessionService,
        },
        {
          provide: DescontoService,
          useValue: mockDescontoService,
        },
        {
          provide: PacoteService,
          useValue: mockPacoteService,
        },
        {
          provide: EventBusService,
          useValue: mockEventBus,
        },
      ],
    }).compile();

    service = module.get<LojaService>(LojaService);
    orderRepository = module.get<Repository<Order>>(getRepositoryToken(Order));

    jest.clearAllMocks();
  });

  describe('createOrder', () => {
    const userId = 'user-1';
    const dto = {
      sessionId: 'session-1',
      seatIds: ['seat-1', 'seat-2'],
    };

    it('should create an order successfully', async () => {
      const session = { id: 'session-1', movie: { title: 'Movie 1' } };
      const seats = [
        { id: 'seat-1', price: 25 },
        { id: 'seat-2', price: 25 },
      ];
      const createdOrder = {
        id: 'order-1',
        userId,
        sessionId: 'session-1',
        seatIds: ['seat-1', 'seat-2'],
        total: 50,
        status: OrderStatus.PENDING,
      };

      mockSessionService.findSessionById.mockResolvedValue(session);
      mockSalaService.reserveSeats.mockResolvedValue(seats);
      mockOrderRepository.create.mockReturnValue(createdOrder);
      mockOrderRepository.save.mockResolvedValue(createdOrder);
      mockEventBus.publish.mockResolvedValue(undefined);

      const result = await service.createOrder(userId, dto);

      expect(result).toEqual(createdOrder);
      expect(mockSalaService.reserveSeats).toHaveBeenCalledWith(dto.seatIds, dto.sessionId);
    });

    it('should throw NotFoundException if session not found', async () => {
      mockSessionService.findSessionById.mockResolvedValue(null);

      await expect(service.createOrder(userId, dto)).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if no seats available', async () => {
      const session = { id: 'session-1' };
      mockSessionService.findSessionById.mockResolvedValue(session);
      mockSalaService.reserveSeats.mockResolvedValue([]);

      await expect(service.createOrder(userId, dto)).rejects.toThrow(BadRequestException);
    });

    it('should apply discount if discount code provided', async () => {
      const dtoWithDiscount = {
        ...dto,
        discountCode: 'DISCOUNT10',
      };
      const session = { id: 'session-1', movie: { title: 'Movie 1' } };
      const seats = [
        { id: 'seat-1', price: 25 },
        { id: 'seat-2', price: 25 },
      ];
      const createdOrder = {
        id: 'order-1',
        userId,
        sessionId: 'session-1',
        seatIds: ['seat-1', 'seat-2'],
        total: 45,
        discountAmount: 5,
        discountCode: 'DISCOUNT10',
        status: OrderStatus.PENDING,
      };

      mockSessionService.findSessionById.mockResolvedValue(session);
      mockSalaService.reserveSeats.mockResolvedValue(seats);
      mockDescontoService.applyDiscount.mockResolvedValue({ amount: 5, finalTotal: 45 });
      mockOrderRepository.create.mockReturnValue(createdOrder);
      mockOrderRepository.save.mockResolvedValue(createdOrder);

      const result = await service.createOrder(userId, dtoWithDiscount);

      expect(mockDescontoService.applyDiscount).toHaveBeenCalledWith('DISCOUNT10', 50);
      expect(result).toEqual(createdOrder);
    });
  });

  describe('findOrderById', () => {
    it('should return an order by id', async () => {
      const order = { id: 'order-1', tickets: [], session: {} };
      
      mockOrderRepository.findOne.mockResolvedValue(order);

      const result = await service.findOrderById('order-1');

      expect(result).toEqual(order);
    });

    it('should throw NotFoundException if order not found', async () => {
      mockOrderRepository.findOne.mockResolvedValue(null);

      await expect(service.findOrderById('999')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findUserOrders', () => {
    it('should return user orders', async () => {
      const orders = [
        { id: 'order-1', userId: 'user-1' },
        { id: 'order-2', userId: 'user-1' },
      ];
      
      mockOrderRepository.find.mockResolvedValue(orders);

      const result = await service.findUserOrders('user-1');

      expect(mockOrderRepository.find).toHaveBeenCalled();
      expect(result).toEqual(orders);
    });
  });

  describe('updateOrderStatus', () => {
    it('should update order status', async () => {
      const order = { id: 'order-1', status: OrderStatus.PENDING };
      
      mockOrderRepository.findOne.mockResolvedValue(order);
      mockOrderRepository.save.mockResolvedValue({ ...order, status: OrderStatus.PAID });

      const result = await service.updateOrderStatus('order-1', OrderStatus.PAID);

      expect(result.status).toBe(OrderStatus.PAID);
    });
  });

  describe('cancelOrder', () => {
    it('should cancel order successfully', async () => {
      const order = {
        id: 'order-1',
        status: OrderStatus.PENDING,
        seatIds: ['seat-1', 'seat-2'],
      };
      
      mockOrderRepository.findOne.mockResolvedValue(order);
      mockSalaService.releaseSeats.mockResolvedValue([]);
      mockOrderRepository.save.mockResolvedValue({ ...order, status: OrderStatus.CANCELLED });

      const result = await service.cancelOrder('order-1');

      expect(mockSalaService.releaseSeats).toHaveBeenCalledWith(['seat-1', 'seat-2']);
      expect(result.status).toBe(OrderStatus.CANCELLED);
    });

    it('should throw BadRequestException if order is already paid', async () => {
      const order = {
        id: 'order-1',
        status: OrderStatus.PAID,
        seatIds: ['seat-1', 'seat-2'],
      };
      
      mockOrderRepository.findOne.mockResolvedValue(order);

      await expect(service.cancelOrder('order-1')).rejects.toThrow(BadRequestException);
    });
  });
});
