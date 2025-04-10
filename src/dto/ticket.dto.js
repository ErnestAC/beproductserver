// src/dto/ticket.dto.js

export class TicketDTO {
    constructor(ticket) {
        this.tid = ticket.code; // renamed for clarity
        this.amount = ticket.amount;
        this.purchaser = ticket.purchaser;
        this.purchase_datetime = ticket.purchase_datetime;
        this.purchasedProducts = ticket.purchasedProducts?.map(prod => ({
            pid: prod.pid,
            quantity: prod.quantity
        })) || [];
        this.notPurchasedProducts = ticket.notPurchasedProducts?.map(prod => ({
            pid: prod.pid,
            quantity: prod.quantity
        })) || [];
    }
}
