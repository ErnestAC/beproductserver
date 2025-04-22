// src/dto/ticket.dto.js

export class TicketDTO {
    constructor(ticket) {
        this.mongoID = _id; // db mongoID is only used by Mongo, I use tid to identify the cart in the rest of the code.
        this.tid = ticket.tid; // this is the ticket ID number, the tid is what identifies the carts widely in this app.
        this.amount = ticket.amount;
        this.purchaser = ticket.purchaser;
        this.purchase_datetime = ticket.purchase_datetime;
        this.purchased = ticket.purchased || [];
        this.notPurchased = ticket.notPurchased || [];
    }
}
