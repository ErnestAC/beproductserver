class CartServices {
    async createCart() {
        return await cartDao.create();
    }
}