//cart.dao.js
import { v4 as uuidv4 } from "uuid";
import { Cart } from "../models/cart.model.js";
import { notifyCartChange } from "../../../server.js";
import { ProductModel } from "../models/product.model.js";

export class CartDao {
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
            
            if (sort && sortOrder) {
                sortCriteria[sort] = sortOrder === 'desc' ? -1 : 1;
            }

            return Cart.find()
                .skip((page - 1) * limit)
                .limit(limit)
                .sort(sortCriteria)
                .populate('products.pid');
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

    // New method added here
    async deleteProductFromCart(cid, pid) {
        try {
            const cart = await Cart.findOne({ cid });
            if (!cart) {
                throw new Error(`Cart with ID ${cid} not found.`);
            }

            const productIndex = cart.products.findIndex(item => item.pid === pid);
            if (productIndex === -1) {
                throw new Error(`Product with ID ${pid} not found in cart.`);
            }

            cart.products.splice(productIndex, 1);
            await cart.save();

            notifyCartChange();
            return cart;

        } catch (err) {
            console.error("Error deleting product from cart:", err);
            throw err;
        }
    }
}

export const cartDao = new CartDao();
