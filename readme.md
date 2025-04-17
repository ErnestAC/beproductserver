# Proyecto de Programación Backend II

## Descripción del Proyecto

El proyecto consiste en el desarrollo del backend para una tienda de modelos de trenes llamada **Shopnhour**.  
Este backend está construido utilizando **Node.js** y **Express**, con una base de datos **MongoDB**.  
Las funcionalidades principales incluyen:

- **Catálogo de productos** almacenado en la colección `products`.
- **Gestión de carritos de compras** en la colección `carts`.
- **Generación y gestión de tickets de compra** en la colección `tickets`.
- **Autenticación y autorización de usuarios**, con roles diferenciados (`user`, `admin`).

## Alumno

Ernesto AC

Desarrollo Avanzado de Backend, Comisión 70470

---

## Navegación

El proyecto inicia con una página principal y proporciona una barra de navegación para acceder a las siguientes secciones:

- Lista de productos.
- Gestión de carritos de compras.
- Panel de administración (para usuarios con rol `admin`).
- Información del usuario actual.
- Vista de tickets de compra (para administradores).

---

## Rutas

### 🔹 API Endpoints

#### **Productos**

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/products/` | Devuelve todos los productos de la colección `products` en MongoDB (paginado). |
| GET | `/api/products/:pid` | Devuelve un producto por su **ID único (`pid`)**. |
| POST | `/api/products/` | Crea un producto con los parámetros enviados en el **body** del request. |
| PUT | `/api/products/:pid` | Modifica un producto existente mediante su **ID único**. |
| DELETE | `/api/products/:pid` | Elimina o marca como eliminado un producto. El parámetro **`killFlag`** en el body define el comportamiento. |

#### **Carritos**

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/carts/` | Devuelve todos los carritos con información detallada de los productos. |
| POST | `/api/carts/` | Crea un nuevo carrito con un **ID único** y lo retorna. |
| GET | `/api/carts/:cid` | Lista los productos dentro del carrito especificado por **ID (`cid`)**. |
| POST | `/api/carts/:cid/product/:pid` | Agrega un producto (`pid`) al carrito (`cid`) o incrementa su cantidad. |
| PATCH | `/api/carts/:cid/product/:pid` | Actualiza la cantidad del producto indicado en el carrito. |
| DELETE | `/api/carts/:cid/product/:pid` | Elimina un producto (`pid`) del carrito (`cid`). |
| DELETE | `/api/carts/:cid` | Elimina **todos los productos** de un carrito por su **ID (`cid`)**. |
| POST | `/api/carts/:cid/purchase` | Procesa la compra del carrito especificado, generando un ticket correspondiente. |

#### **Tickets**

> ⚠️ **Todas las rutas relacionadas con tickets requieren autenticación y rol de `admin`.**

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/tickets/` | Devuelve todos los tickets generados en el sistema. |
| GET | `/api/tickets/:tid` | Devuelve un ticket específico por su **ID único (`tid`)**. |

#### **Autenticación**

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/api/auth/login` | Realiza el login del usuario utilizando credenciales locales. |
| POST | `/api/auth/register` | Registra un nuevo usuario. |
| GET | `/api/auth/logout` | Finaliza la sesión activa del usuario. |
| GET | `/api/sessions/current` | Devuelve la información del usuario actualmente autenticado. |

---

### 🔹 Vistas Disponibles

| Ruta | Descripción |
|------|-------------|
| `/` | Página principal. |
| `/products` | Catálogo de productos completo. |
| `/carts` | Vista estática de **todos** los carritos en el servidor. |
| `/carts/:cid` | Vista del carrito con el ID `cid`. |
| `/realtime/products` | Vista **en tiempo real** de la colección `products`. |
| `/realtime/carts` | Vista **en tiempo real** de la colección `carts` (**sin detalles de productos, sólo `PID` y `cantidad`**). |
| `/forms/add-product` | Formulario para **agregar** un producto a la base de datos. |
| `/forms/delete-product` | Formulario para **eliminar** un producto de la base de datos. |
| `/login` | Página para iniciar sesión. |
| `/register` | Página para registrar nuevos usuarios. |
| `/current` | Página que muestra la información del usuario actualmente autenticado. |
| `/admin` | Panel de administración (acceso restringido a usuarios con rol `admin`). |
| `/tickets` | Vista de todos los tickets generados (acceso restringido a usuarios con rol `admin`). |
| `/guest-cart` | Vista del carrito de compras como usuario no autenticado. |

---

## Notas Adicionales

- **Autenticación y Autorización**: El sistema utiliza **JWT** para la autenticación de usuarios. Algunas rutas y vistas están protegidas y requieren que el usuario esté autenticado y tenga el rol adecuado (`user` o `admin`).
- **Generación de Tickets**: Al procesar la compra de un carrito (`/api/carts/:cid/purchase`), se genera un ticket que incluye información sobre:
  - los productos comprados,
  - los productos no comprados (por falta de stock),
  - el monto total,
  - el comprador.
- **Panel de Administración**: Los usuarios con rol `admin` tienen acceso a un panel donde pueden gestionar productos, visualizar carritos, y ver todos los tickets generados.
