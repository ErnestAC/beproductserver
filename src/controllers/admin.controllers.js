// controllers/admin.controllers.js
import { productDao } from "../persistence/mongo/dao/product.dao.js";

export async function renderDeleteProductPage(req, res) {
    const page = parseInt(req.query.page) || 1;
    const limit = 10;

    try {
        const result = await productDao.getAllProductsPaginated({ page, limit });
        res.render("deleteProduct", {
            products: result.payload,
            currentPage: result.page,
            hasNextPage: result.hasNextPage,
            hasPrevPage: result.hasPrevPage,
            nextPage: result.nextPage,
            prevPage: result.prevPage
        });
    } catch (err) {
        res.status(500).render("error", { message: "Could not load products." });
    }
}