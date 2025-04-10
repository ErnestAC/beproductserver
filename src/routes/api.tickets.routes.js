
// src/routes/api.tickets.routes.js

import { Router } from "express";
import passport from "../config/passport/passport.config.js";
import { ticketController } from "../controllers/ticket.controllers.js";
import { requireAdminOnly, requireRole } from "../middlewares/role.middleware.js";

const router = Router();
const jwtAuth = passport.authenticate("jwt", { session: false });

// Admin-only routes
router.get("/", jwtAuth, requireRole("admin"), ticketController.getAllTickets);
router.get("/:tid", jwtAuth, requireAdminOnly, ticketController.getTicketById);
router.delete("/:tid", jwtAuth, requireAdminOnly, ticketController.deleteTicketById);

export default router;
