import { Schema, model } from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

const ticketSchema = new Schema(
    {
        cid: {
            type: String,
            unique: true,
        },
        products: [
            {
                pid: {
                    type: String,  // Change from ObjectId to String
                    required: true,
                },
                quantity: {
                    type: Number,
                    default: 1,
                },
            },
        ],
    },
    { timestamps: true }
);

// Add pagination plugin
ticketSchema.plugin(mongoosePaginate);

export const Ticket = model("Ticket", ticketSchema);
