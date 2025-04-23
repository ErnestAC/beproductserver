// src/controllers/ticket.controllers.js

import { ticketService } from "../services/ticket.services.js";
import { errorLog } from "../utils/errorLog.util.js";
import { generateToken } from "../utils/token.util.js"; // NEW

class TicketController {
    async getAllTickets(req, res) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const sort = req.query.sort || "purchase_datetime";
            const sortOrder = req.query.sortOrder === "desc" ? -1 : 1;

            const tickets = await ticketService.getAllTickets({ page, limit, sort, sortOrder });

            res.json({ status: "success", payload: tickets }); //  No token refresh
        } catch (err) {
            errorLog(err, req);
            res.status(500).json({ status: "error", message: "Failed to retrieve tickets" });
        }
    }

    async getTicketById(req, res) {
        try {
            const { tid } = req.params;
            const ticket = await ticketService.getTicketById(tid);
            if (!ticket) {
                return res.status(404).json({ status: "error", message: `Ticket ${tid} not found` });
            }

            res.json({ status: "success", payload: ticket }); //  No token refresh
        } catch (err) {
            errorLog(err, req);
            res.status(500).json({ status: "error", message: "Failed to retrieve ticket" });
        }
    }

    async deleteTicketById(req, res) {
        try {
            const { tid } = req.params;
            const result = await ticketService.deleteTicketById(tid);
            if (!result) {
                return res.status(404).json({ status: "error", message: `Ticket ${tid} not found` });
            }

            const newToken = generateToken(req.user); 
            res.json({ status: "success", message: `Ticket ${tid} deleted`, token: newToken });
        } catch (err) {
            errorLog(err, req);
            res.status(500).json({ status: "error", message: "Failed to delete ticket" });
        }
    }
}

export const ticketController = new TicketController();
