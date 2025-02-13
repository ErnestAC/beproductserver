
# BEPRODUCTSERVER

## Entrega I
Routes
/api/products/

GET /api/products/ - trae todos los datos en products.json
GET /api/products/pid - trae un producto por su ID unico
POST /api/products/ - crea un producto usando los parametros pasados por parametro en el body del req con un id unico
PUT /api/products/pid - modifica un registro existente por ID unico
DELETE /api/products/pid - marca como eliminado o elimina un registro, usa el parametro booleano en body killFlag para cambiar el comportamiento

/api/carts

POST /api/carts/ - crea un nuevo carrito con un id unico
GET /api/carts/cid - lista los contenidos del carrito por ID (cid)
POST /api/carts/cid/product/pid - agrega el producto con el pid pasado o incrementa su cantidad en el carrito con cid pasado

## Nuevas adiciones - Entrega II

GET / vista estatica de todo el inventario (home.handlebars)
GET /realtimeproducts vista dinamica de todo el contenido del inventario usando websockets (realTimeProducts.handlebars)
GET /add-product, interfaz simple para agregar productos (addProduct.hadnlebars) - Usa los endpoints que ya creamos en la entrega enterior
GET /delete-product, interfaz simple para eliminar productos por ID. (deleteProducts.handlebars) - Usa los endpoints que ya creamos en la entrega enterior
