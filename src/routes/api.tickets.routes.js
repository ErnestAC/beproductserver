
// src/routes/api.tickets.routes.js

import { Router } from "express";
import passport from "../config/passport/passport.config.js";
import { ticketController } from "../controllers/ticket.controllers.js";
import { requireRole } from "../middlewares/role.middleware.js";

const router = Router();
const jwtAuth = passport.authenticate("jwt", { session: false });

// Admin-only routes
router.get("/", jwtAuth, requireRole("admin"), ticketController.getAllTickets);
router.get("/:tid", jwtAuth, requireRole("admin"), ticketController.getTicketById);
router.delete("/:tid", jwtAuth, requireRole("admin"), ticketController.deleteTicketById);

export default router;
