import { v4 as uuid } from "uuid";
import { TicketDao } from "../persistence/mongo/dao/ticket.dao";

class TicketService {
    async createTicket(amount, userMail) {
        const newTicket = {
            code: uuid,
            purchaser: userMail,
            amount
        };
        
        const ticket = await TicketDao.addTicket(newTicket);

        return ticket;
    }
}

export const ticketService = new TicketService