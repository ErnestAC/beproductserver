// src/services/ticket.services.js
import { ticketDao } from "../persistence/mongo/dao/ticket.dao.js";
import { TicketDTO } from "../dto/ticket.dto.js";
import { sendEmail } from "../utils/email.util.js";
import { generateTicketHTML } from "../utils/emailTemplates.util.js";

class TicketService {
    async createTicket({ amount, purchaser, purchased = [], notPurchased = [] }) {
        const ticket = await ticketDao.addTicket({
            amount,
            purchaser,
            purchased,
            notPurchased
        });

        console.log("Raw ticket keys:", Object.keys(ticket.toObject ? ticket.toObject() : ticket));
        const dto = new TicketDTO(ticket.toObject ? ticket.toObject() : ticket);

        console.log(dto);
        console.log(ticket);

        const html = generateTicketHTML({
            tid: dto.tid,
            purchaser: dto.purchaser,
            purchased: dto.purchased,
            notPurchased: dto.notPurchased,
            total: dto.amount
        });

        // TEMPORARY: email goes to dev/test inbox
        // To revert, just change 'recipient' to 'dto.purchaser'
        const recipient = "shopnhour.store@gmail.com"; // change to dto.purchaser when ready

        await sendEmail({
            to: recipient,
            subject: `Your Order Confirmation - Ticket #${dto.tid}`,
            html
        });

        return dto;
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
