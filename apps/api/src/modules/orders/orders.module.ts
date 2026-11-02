import { Module } from '@nestjs/common'
import { IdentityModule } from '../identity/identity.module.js'
import { CancellationRequestService } from './cancellation-request.service.js'
import { FulfillmentService } from './fulfillment.service.js'
import { IssueQuoteService } from './issue-quote.service.js'
import { OrderActionController } from './order-action.controller.js'
import { OrderActionService } from './order-action.service.js'
import { OrderConfirmService } from './order-confirm.service.js'
import { OrderListController } from './order-list.controller.js'
import { OrderReadService } from './order-read.service.js'
import { PlaceOrderService } from './place-order.service.js'
import { ProductionIssueService } from './production-issue.service.js'
import { QuoteOfferController } from './quote-offer.controller.js'
import { QuoteOfferService } from './quote-offer.service.js'
import { ShipmentEventService } from './shipment-event.service.js'
import { StudioOrderController } from './studio-order.controller.js'
import { StudioOrderService } from './studio-order.service.js'

@Module({
  imports: [IdentityModule],
  controllers: [OrderListController, QuoteOfferController, OrderActionController, StudioOrderController],
  providers: [
    PlaceOrderService,
    OrderReadService,
    IssueQuoteService,
    QuoteOfferService,
    OrderConfirmService,
    CancellationRequestService,
    OrderActionService,
    ProductionIssueService,
    ShipmentEventService,
    FulfillmentService,
    StudioOrderService,
  ],
  exports: [PlaceOrderService],
})
export class OrdersModule {}
