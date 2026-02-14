import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

export interface CinemaEvent {
  type: string;
  payload: any;
  timestamp: Date;
}

@Injectable()
export class EventBusService {
  private readonly logger = new Logger(EventBusService.name);
  private eventHandlers: Map<string, Function[]> = new Map();

  async publish(eventType: string, payload: any): Promise<void> {
    const event: CinemaEvent = {
      type: eventType,
      payload,
      timestamp: new Date(),
    };
    this.logger.log(`Publishing event: ${eventType}`, payload);

    const handlers = this.eventHandlers.get(eventType);
    if (handlers) {
      // Execute handlers asynchronously
      await Promise.all(handlers.map((handler) => handler(event)));
    }
  }

  subscribe(eventType: string, handler: Function) {
    if (!this.eventHandlers.has(eventType)) {
      this.eventHandlers.set(eventType, []);
    }
    this.eventHandlers.get(eventType)?.push(handler);
  }

  @OnEvent('PaymentApproved')
  handlePaymentApproved(event: CinemaEvent) {
    this.logger.log('PaymentApproved event received', event.payload);
  }

  @OnEvent('TicketIssued')
  handleTicketIssued(event: CinemaEvent) {
    this.logger.log('TicketIssued event received', event.payload);
  }
}
