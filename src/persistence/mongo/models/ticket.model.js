// ticket.model.js
import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";
import mongoosePaginate from "mongoose-paginate-v2";

const ticketCollection = "ticket";

const ticketSchema = new mongoose.Schema({
    tid: {
        type: String,
        default: uuidv4,
        unique: true
    },
    purchase_datetime: {
        type: Date,
        default: Date.now
    },
    amount: {
        type: Number,
        required: true
    },
    purchaser: {
        type: String,
        required: true
    },
    purchasedProducts: {
        type: Array,
        default: []
    },
    notPurchasedProducts: {
        type: Array,
        default: []
    }
});

ticketSchema.plugin(mongoosePaginate);

export const ticket = mongoose.model(ticketCollection, ticketSchema);
