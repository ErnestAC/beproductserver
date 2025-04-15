export function validateCompletenessOfProduct(Product){
    let result = false
    if (Product.title &&
        Product.handle &&
        Product.description &&
        Product.code &&
        Product.price &&
        Product.stock &&
        Product.category &&
        Product.wheelArrangement &&
        Product.wheelArrangement &&
        Product.pieces
    ) {        
        result = true
    }

    return result
}

export default validateCompletenessOfProduct;