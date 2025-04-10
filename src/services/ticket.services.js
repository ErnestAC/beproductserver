// src/services/ticket.services.js
import { ticketDao } from "../persistence/mongo/dao/ticket.dao.js";
import { TicketDTO } from "../dto/ticket.dto.js";

class TicketService {
    async createTicket({ amount, purchaser, purchased = [], notPurchased = [] }) {

        console.log({ amount, purchaser, purchased , notPurchased  });
        const ticket = await ticketDao.addTicket({
            amount,
            purchaser,
            purchased,
            notPurchased
        });

        return new TicketDTO(ticket.toObject ? ticket.toObject() : ticket);
    }
}

export const ticketService = new TicketService();
