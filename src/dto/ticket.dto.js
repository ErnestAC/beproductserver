// src/dto/ticket.dto.js

export class TicketDTO {
    constructor(ticket) {
        this.tid = ticket.tid;
        this.amount = ticket.amount;
        this.purchaser = ticket.purchaser;
        this.purchase_datetime = ticket.purchase_datetime;
        this.purchased = ticket.purchased || [];
        this.notPurchased = ticket.notPurchased || [];
    }
}
