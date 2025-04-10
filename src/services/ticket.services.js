// src/services/ticket.services.js
import { ticketDao } from "../persistence/mongo/dao/ticket.dao.js";

class TicketService {
    async createTicket(amount, purchaserEmail) {
        console.log(amount)
        if (typeof amount !== "number") {
            throw new Error("Invalid amount passed to ticket creation");
        }
    
        return await ticketDao.addTicket({
            amount,
            purchaser: purchaserEmail
        });
    }
}

export const ticketService = new TicketService();
