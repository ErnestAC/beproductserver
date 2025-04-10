// src/services/ticket.services.js
import { ticketDao } from "../persistence/mongo/dao/ticket.dao.js";
import { TicketDTO } from "../dto/ticket.dto.js";

class TicketService {
    async createTicket({ amount, purchaser, purchasedProducts = [], notPurchasedProducts = [] }) {


        const ticket = await ticketDao.addTicket({
            amount,
            purchaser,
            purchasedProducts,
            notPurchasedProducts
        });

        return new TicketDTO(ticket.toObject ? ticket.toObject() : ticket);
    }
}

export const ticketService = new TicketService();
