import { v4 as uuidv4 } from "uuid";
import { Cart } from "../models/cart.model.js";
import { notifyCartChange } from "../server.js";
import { ProductModel } from "../models/product.model.js";

export class CartManager {
    async getAllCarts() {
        try {
            return await Cart.find();
        } catch (err) {
            console.error("error retrieving carts:", err);
            throw err;
        }
    }    

    async addCart() {
        try {
            const newCart = new Cart({
                cid: uuidv4(),
                products: [],
            });
            await newCart.save();
            notifyCartChange(); 
            return newCart;
        } catch (err) {
            console.error("error adding cart:", err);
            throw err;
        }
    }

    async addProductToCart(cid, pid) {
        try {
            const product = await ProductModel.findOne({ pid });
            if (!product) {
                throw Error(`product with id ${pid} not found`);
            }
            if (product.stock <= 0) {
                throw Error(`product with id ${pid} is out of stock`);
            }

            const cart = await Cart.findOne({ cid });
            if (!cart) {
                throw Error(`cart with id ${cid} not found`);
            }

            const productInCart = cart.products.find(item => item.pid === pid);

            if (productInCart) {
                productInCart.quantity += 1;
            } else {
                cart.products.push({ pid, quantity: 1 });
            }

            await cart.save();
            notifyCartChange(); 
            return cart;
        } catch (err) {
            console.error("error adding product to cart:", err);
            throw err;
        }
    }

    async getCartById(cartId) {
        try {
            const cart = await Cart.findOne({ cid: cartId });
            if (!cart) return null;
    
            const cartObject = cart.toObject();
    
            const productIds = cartObject.products.map(p => p.pid);
    
            const productsMap = new Map();
            if (productIds.length > 0) {
                const products = await ProductModel.find({ pid: { $in: productIds } });
                products.forEach(product => {
                    productsMap.set(product.pid, product);
                });
            }
    
            cartObject.products.forEach(product => {
                const productDetails = productsMap.get(product.pid);
                if (productDetails) {
                    Object.assign(product, productDetails.toObject());
                }
            });
    
            return cartObject; 
        } catch (err) {
            console.error("error retrieving cart by id:", err);
            throw err;
        }
    }
    

    async getCartByIdMongoose(cartId) {
        try {
            return await Cart.findOne({ cid: cartId }) || null;
        } catch (err) {
            console.error("error retrieving cart by id:", err);
            throw err;
        }
    }

    async getAllCartsMongoose(page, limit, sort, sortOrder) {
        try {
            const sortCriteria = {};
            
            // Check if sort is provided, then apply sortOrder
            if (sort && sortOrder) {
                sortCriteria[sort] = sortOrder === 'desc' ? -1 : 1;  // Descending if 'desc', ascending if 'asc'
            }
    
            // Return the query object with skip, limit, and sort applied
            return Cart.find()
                .skip((page - 1) * limit)
                .limit(limit)
                .sort(sortCriteria)
                .populate('products.pid');  // Populate the 'pid' in 'products' field with product details
        } catch (err) {
            console.error("Error retrieving carts:", err);
            throw err;
        }
    }
    
    

    async deleteCartById(cartId) {
        try {
            const deletedCart = await Cart.findOneAndDelete({ cid: cartId });
            if (!deletedCart) {
                console.warn(`cart with id ${cartId} not found.`);
                return false;
            }
            notifyCartChange(); 
            return true;
        } catch (err) {
            console.error("error deleting cart by id:", err);
            throw err;
        }
    }

    async clearCartById(cartId) {
        try {
            const cart = await Cart.findOne({ cid: cartId });
            if (!cart) {
                throw Error(`cart with id ${cartId} not found`);
            }
    
            cart.products = [];
    
            await cart.save();
            notifyCartChange(); 
            return cart;
        } catch (err) {
            console.error("error clearing cart contents:", err);
            throw err;
        }
    }
}

export const cartManager = new CartManager();
