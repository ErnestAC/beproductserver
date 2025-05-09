// index.routes.js
import passport from "../config/passport/passport.config.js";
import { requireAdminOrOwner, requireLoggedOutOrRole, requireRole } from "../middlewares/role.middleware.js";

import { ProductModel } from "../persistence/mongo/models/product.model.js";
import { Router } from "express";

import { cartDao } from "../persistence/mongo/dao/cart.dao.js";
import { Cart } from "../persistence/mongo/models/cart.model.js";

import { ticket } from "../persistence/mongo/models/ticket.model.js";
import { ProductDTO } from "../dto/product.dto.js";
import { UserDTO } from "../dto/user.dto.js";
import { errorLog } from "../utils/errorLog.util.js";

const router = Router();
const jwtAuth = passport.authenticate("jwt", { session: false });

router.get('/', async (req, res) => {
    try {
        res.render('index');
    } catch (err) {
        console.error('Error rendering home page:', err);
        res.status(500).send("Error rendering home page");
    }
});

router.get("/login", requireLoggedOutOrRole(), (req, res) => {
    res.render("login"); 
});

router.get("/register", requireLoggedOutOrRole(), (req, res) => {
    res.render("register");
});

router.get('/products', async (req, res) => {
    let { page = 1, limit = 12, sort = 'title', sortOrder = 'asc', filterBy = '' } = req.query;

    page = Math.max(1, Number(page));
    limit = Math.max(1, Number(limit));
    const sortDirection = sortOrder === 'desc' ? -1 : 1;

    try {
        const query = filterBy ? { category: filterBy } : {};
        const options = {
            page,
            limit,
            sort: { [sort]: sortDirection },
            lean: true
        };

        const result = await ProductModel.paginate(query, options);
        const dtoProducts = result.docs.map(p => new ProductDTO(p));

        res.render('productsStatic', {
            products: dtoProducts,
            currentPage: result.page,
            totalPages: result.totalPages,
            prevPage: result.prevPage,
            nextPage: result.nextPage,
            totalItems: result.totalDocs,
            limit,
            sort,
            sortOrder,
            filterBy
        });

    } catch (err) {
        console.error('Error rendering products page:', err);
        res.status(500).send("Error rendering products");
    }
});

router.get('/carts', jwtAuth, requireAdminOrOwner(), async (req, res) => {
    try {
        let { limit = 10, page = 1, sort = 'createdAt', sortOrder = 'desc' } = req.query;
        limit = Math.max(1, Number(limit) || 10);
        page = Math.max(1, Number(page));
        const sortDirection = sortOrder === 'desc' ? -1 : 1;

        const options = {
            page,
            limit,
            sort: { [sort]: sortDirection },
            lean: true
        };

        const result = await Cart.paginate({}, options);

        for (let cart of result.docs) {
            for (let item of cart.products) {
                const product = await ProductModel.findById(item.pid).lean();
                if (product) {
                    item.productDetails = product;
                }
            }
        }

        res.render('cartsStatic', {
            carts: result.docs,
            currentPage: result.page,
            totalPages: result.totalPages,
            prevPage: result.prevPage,
            nextPage: result.nextPage,
            hasPrevPage: result.hasPrevPage,
            hasNextPage: result.hasNextPage,
            sort,
            sortOrder,
            limit,
        });

    } catch (error) {
        console.error("Error fetching carts:", error);
        res.status(500).send("Internal Server Error");
    }
});

router.get('/carts/:cid', jwtAuth, requireAdminOrOwner(), async (req, res) => {
    const { cid } = req.params;
    try {
        const cart = await cartDao.getCartById(cid);
        if (!cart) {
            return res.status(404).render("cart", { error: "Cart not found" });
        }

        cart.products = cart.products.map(p => {
            const product = p.pid;
            return {
                _id: product._id.toString(),
                pid: product._id.toString(),
                title: product.title,
                imageURL: product.imageURL,
                code: product.code,
                description: product.description,
                pieces: product.pieces,
                price: product.price,
                quantity: p.quantity
            };
        });

        res.render("cart", { cart });
    } catch (err) {
        errorLog(err);
        return res.status(500).render("cart", { error: "Failed to load cart" });
    }
});

router.get("/current", jwtAuth, (req, res) => {
    const userDto = new UserDTO(req.user);
    res.render("current", { user: userDto });
});

router.get("/logout", jwtAuth, (req, res) => {
    res.clearCookie("token");
    res.redirect("/login");
});

router.get("/guest-cart", (req, res) => {
    res.render("guestCart");
});

router.get("/admin", jwtAuth, requireAdminOrOwner(), (req, res) => {
    res.render("admin");
});

router.get('/tickets', jwtAuth, requireRole("admin"), async (req, res) => {
    try {
        let { limit = 10, page = 1, sort = 'purchase_datetime', sortOrder = 'desc' } = req.query;
        limit = Math.max(1, Number(limit) || 10);
        page = Math.max(1, Number(page));
        const sortDirection = sortOrder === 'desc' ? -1 : 1;

        const options = {
            page,
            limit,
            sort: { [sort]: sortDirection },
            lean: true
        };

        const result = await ticket.paginate({}, options);

        res.render("ticketsStatic", {
            tickets: result.docs,
            currentPage: result.page,
            totalPages: result.totalPages,
            prevPage: result.prevPage,
            nextPage: result.nextPage,
            hasPrevPage: result.hasPrevPage,
            hasNextPage: result.hasNextPage,
            limit,
            sort,
            sortOrder
        });
    } catch (err) {
        console.error("Error rendering tickets:", err);
        res.status(500).send("Error rendering tickets");
    }
});

router.get('/products/:pid', async (req, res) => {
    try {
        const { pid } = req.params;
        const product = await ProductModel.findById(pid).lean();

        if (!product) {
            return res.status(404).render("productDetail", { error: "Product not found" });
        }

        const dto = new ProductDTO(product);
        res.render("productDetail", { product: dto });
    } catch (err) {
        console.error("Error rendering product detail:", err);
        res.status(500).render("productDetail", { error: "Internal Server Error" });
    }
});

export default router;
