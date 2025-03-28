import { productManager } from "../persistence/mongo/managers/product.manager.js";

export const notifyProductChange = async () => {
    try {
        const products = await productManager.getAllProducts({
            limit: 50,
            sort: 'price',
            sortDirection: -1,
        });
        

        return products;
    } catch (err) {
        console.error('Error preparing product change notification:', err);
        throw err;
    }
};