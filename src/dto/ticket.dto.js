// src/dto/ticket.dto.js

export class TicketDTO {
    constructor(ticket) {
        this.tid = ticket.code; // renamed for clarity
        this.amount = ticket.amount;
        this.purchaser = ticket.purchaser;
        this.purchase_datetime = ticket.purchase_datetime;
        this.purchased = ticket.purchased?.map(prod => ({
            pid: prod.pid,
            quantity: prod.quantity
        })) || [];
        this.notpurchased = ticket.notpurchased?.map(prod => ({
            pid: prod.pid,
            quantity: prod.quantity
        })) || [];
    }
}
