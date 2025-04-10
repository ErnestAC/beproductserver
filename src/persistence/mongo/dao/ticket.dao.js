//ticket.dao.js
import { v4 as uuidv4 } from "uuid";
import { ticket as Ticket } from "../models/ticket.model.js";
import { ProductModel } from "../models/product.model.js";

export class TicketDao {
    async getAllTickets() {
        try {
            return await Ticket.find();
        } catch (err) {
            console.error("error retrieving tickets:", err);
            throw err;
        }
    }    

async addTicket({ amount, purchaser }) {
    try {
        const newTicket = new Ticket({
            code: uuidv4(),
            amount,
            purchaser,
            purchase_datetime: new Date()
        });

        await newTicket.save();
        return newTicket;
    } catch (err) {
        console.error("Error adding ticket:", err);
        throw err;
    }
}

    async addProductToTicket(cid, pid) {
        try {
            const product = await ProductModel.findOne({ pid });
            if (!product) {
                throw Error(`product with id ${pid} not found`);
            }
            if (product.stock <= 0) {
                throw Error(`product with id ${pid} is out of stock`);
            }

            const ticket = await Ticket.findOne({ cid });
            if (!ticket) {
                throw Error(`ticket with id ${cid} not found`);
            }

            const productInTicket = ticket.products.find(item => item.pid === pid);

            if (productInTicket) {
                productInTicket.quantity += 1;
            } else {
                ticket.products.push({ pid, quantity: 1 });
            }

            await ticket.save();
            
            return ticket;
        } catch (err) {
            console.error("error adding product to ticket:", err);
            throw err;
        }
    }

    async getTicketById(ticketId) {
        try {
            const ticket = await Ticket.findOne({ cid: ticketId });
            if (!ticket) return null;
    
            const ticketObject = ticket.toObject();
    
            const productIds = ticketObject.products.map(p => p.pid);
    
            const productsMap = new Map();
            if (productIds.length > 0) {
                const products = await ProductModel.find({ pid: { $in: productIds } });
                products.forEach(product => {
                    productsMap.set(product.pid, product);
                });
            }
    
            ticketObject.products.forEach(product => {
                const productDetails = productsMap.get(product.pid);
                if (productDetails) {
                    Object.assign(product, productDetails.toObject());
                }
            });
    
            return ticketObject; 
        } catch (err) {
            console.error("error retrieving ticket by id:", err);
            throw err;
        }
    }
    

    async getTicketByIdMongoose(ticketId) {
        try {
            return await Ticket.findOne({ cid: ticketId }) || null;
        } catch (err) {
            console.error("error retrieving ticket by id:", err);
            throw err;
        }
    }

    async getAllTicketsMongoose(page, limit, sort, sortOrder) {
        try {
            const sortCriteria = {};
            
            // Check if sort is provided, then apply sortOrder
            if (sort && sortOrder) {
                sortCriteria[sort] = sortOrder === 'desc' ? -1 : 1;  // Descending if 'desc', ascending if 'asc'
            }
    
            // Return the query object with skip, limit, and sort applied
            return Ticket.find()
                .skip((page - 1) * limit)
                .limit(limit)
                .sort(sortCriteria)
                .populate('products.pid');  // Populate the 'pid' in 'products' field with product details
        } catch (err) {
            console.error("Error retrieving tickets:", err);
            throw err;
        }
    }
    
    

    async deleteTicketById(ticketId) {
        try {
            const deletedTicket = await Ticket.findOneAndDelete({ cid: ticketId });
            if (!deletedTicket) {
                console.warn(`ticket with id ${ticketId} not found.`);
                return false;
            }
            
            return true;
        } catch (err) {
            console.error("error deleting ticket by id:", err);
            throw err;
        }
    }

    async clearTicketById(ticketId) {
        try {
            const ticket = await Ticket.findOne({ cid: ticketId });
            if (!ticket) {
                throw Error(`ticket with id ${ticketId} not found`);
            }
    
            ticket.products = [];
    
            await ticket.save();
        
            return ticket;
        } catch (err) {
            console.error("error clearing ticket contents:", err);
            throw err;
        }
    }
}

export const ticketDao = new TicketDao();
