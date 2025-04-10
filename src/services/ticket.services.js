// src/services/ticket.services.js
import { ticketDao } from "../persistence/mongo/dao/ticket.dao.js";
import { TicketDTO } from "../dto/ticket.dto.js";

class TicketService {
    async createTicket({ amount, purchaser, purchased = [], notPurchased = [] }) {
        const ticket = await ticketDao.addTicket({
            amount,
            purchaser,
            purchasedProducts: purchased,
            notPurchased: notPurchased
        });

        return new TicketDTO(ticket.toObject ? ticket.toObject() : ticket);
    }

    async getAllTickets({ page = 1, limit = 10, sort = "purchase_datetime", sortOrder = 1 }) {
        const results = await ticketDao.getAllTicketsMongoose(page, limit, sort, sortOrder);
        return results.map(ticket => new TicketDTO(ticket.toObject ? ticket.toObject() : ticket));
    }

    async getTicketById(tid) {
        const ticket = await ticketDao.getTicketById(tid);
        if (!ticket) return null;
        return new TicketDTO(ticket);
    }

    async deleteTicketById(tid) {
        return await ticketDao.deleteTicketById(tid);
    }
}

export const ticketService = new TicketService();
