# Proyecto de Programación Backend I

## De qué se trata este proyecto

El proyecto consiste en un backend para una tienda de modelos de trenes llamada **Shopnhour**.  
Integra una base de datos (**MongoDB**) sobre **Node.js** y **Express** para montar un servicio de backend que provee:  

- Un **catálogo de productos** almacenado en la colección `products`  
- La **gestión de carritos de compras**, almacenados en la colección `carts`  

## Alumno  

**Ernesto AC**  

**Desarrollo Avanzado de Backend, Comisión 70470**  

---

## Navegación  

El proyecto comienza con esta página y provee una barra de navegación para moverse por algunas de las operaciones básicas:  

- Lista de productos  
- Gestión de carritos de compras  

### **Consideraciones**

- 🔒 El proyecto **no implementa sesiones ni autenticación aún**, por lo que el carrito al que agregamos productos desde este frontend está **hardcodeado** en:  
  **`5ab6e82f-b289-4dff-8ff5-25dc0f749ee2`**  
  (Carrito preexistente en MongoDB).
- 🛒 El botón **"Add to Cart"** en la vista [`/products`](#rutas) **agrega productos** al carrito mencionado arriba.

---

## Rutas

### **🔹 API Endpoints**

| Método  | Ruta | Descripción |
|---------|------|------------|
| **GET**  | `/api/products/` | Devuelve todos los productos de la colección `products` en MongoDB (paginado). |
| **GET**  | `/api/products/:pid` | Devuelve un producto por su **ID único (`pid`)**. |
| **POST** | `/api/products/` | Crea un producto con los parámetros enviados en el **body** del request. |
| **PUT**  | `/api/products/:pid` | Modifica un producto existente mediante su **ID único**. |
| **DELETE** | `/api/products/:pid` | Elimina o marca como eliminado un producto. El parámetro **`killFlag`** en el body define el comportamiento. |
| **GET**  | `/api/carts/` | Devuelve todos los carritos con información detallada de los productos. |
| **POST** | `/api/carts/` | Crea un nuevo carrito con un **ID único** y lo retorna. |
| **GET**  | `/api/carts/:cid` | Lista los productos dentro del carrito especificado por **ID (`cid`)**. |
| **POST** | `/api/carts/:cid/product/:pid` | Agrega un producto (`pid`) al carrito (`cid`) o incrementa su cantidad. |
| **DELETE** | `/api/carts/:cid/product/:pid` | Elimina un producto (`pid`) del carrito (`cid`). |
| **DELETE** | `/api/carts/:cid` | Elimina **todos los productos** de un carrito por su **ID (`cid`)**. |

---

### **🔹 Vistas Disponibles**

| Ruta | Descripción |
|------|------------|
| **`/`** | Página principal |
| **`/products`** | Catálogo de productos completo |
| **`/carts`** | Vista estática de **todos** los carritos en el servidor |
| **`/carts/:cid`** | Vista del carrito con el ID `cid` |
| **`/realtime/products`** | Vista **en tiempo real** de la colección `products` |
| **`/realtime/carts`** | Vista **en tiempo real** de la colección `carts` (**sin detalles de productos, sólo `PID` y `cantidad`**) |
| **`/forms/add-product`** | Formulario para **agregar** un producto a la base de datos |
| **`/forms/delete-product`** | Formulario para **eliminar** un producto de la base de datos |

---

