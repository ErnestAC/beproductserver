# Proyecto de Programación Backend II

## Descripción del Proyecto

El proyecto consiste en el desarrollo del backend para una tienda de modelos de trenes llamada **Shopnhour**.  
Este backend está construido utilizando **Node.js** y **Express**, con una base de datos **MongoDB**.  
Las funcionalidades principales incluyen:

- **Catálogo de productos** almacenado en la colección `products`.
- **Gestión de carritos de compras** en la colección `carts`.
- **Generación y gestión de tickets de compra** en la colección `tickets`.
- **Gestión de usuarios** en la colección `users`.
- **Autenticación y autorización de usuarios**, con roles diferenciados (`user`, `admin`).
- **Renovación automática de tokens JWT** en acciones clave.
- **Soporte para carritos de invitados** utilizando `localStorage`.
- **Visualización en tiempo real** de productos y carritos usando **Socket.IO**.
- **Edición de datos de usuarios** (nombre, apellido y rol) para administradores.
- **Protección de datos sensibles** mediante DTOs (`dateOfBirth`, `gid` ocultos, `age` calculada).

## Alumno

Ernesto AC

Desarrollo Avanzado de Backend, Comisión 70470

---

## Navegación

El proyecto inicia con una página principal y proporciona una barra de navegación para acceder a las siguientes secciones:

- Lista de productos.
- Gestión de carritos de compras.
- Panel de administración (para usuarios con rol `admin`).
- Edición de usuarios (solo para administradores).
- Información del usuario actual.
- Vista de tickets de compra (para administradores).
- Carrito para usuarios invitados.

---

## Rutas

### API Endpoints

#### Productos

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/products/` | Devuelve todos los productos (paginado, ordenado, filtrado). |
| GET | `/api/products/:pid` | Devuelve un producto por su ID único (`pid`). |
| POST | `/api/products/` | Crea un nuevo producto. |
| PUT | `/api/products/:pid` | Actualiza un producto existente. |
| DELETE | `/api/products/:pid` | Elimina o marca como eliminado un producto (`killFlag`). |

#### Carritos

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/carts/` | Devuelve todos los carritos (acceso restringido a admin/propietario). |
| POST | `/api/carts/` | Crea un nuevo carrito. |
| GET | `/api/carts/:cid` | Obtiene los productos dentro de un carrito. |
| POST | `/api/carts/:cid/product/:pid` | Agrega o incrementa un producto en el carrito. |
| PATCH | `/api/carts/:cid/product/:pid` | Actualiza la cantidad de un producto en el carrito. |
| DELETE | `/api/carts/:cid/product/:pid` | Elimina un producto del carrito. |
| DELETE | `/api/carts/:cid` | Vacía todo el carrito. |
| POST | `/api/carts/:cid/purchase` | Procesa la compra del carrito y genera un ticket. |

#### Tickets

> Todas las rutas de tickets requieren autenticación y rol `admin`.

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/tickets/` | Lista todos los tickets generados. |
| GET | `/api/tickets/:tid` | Devuelve un ticket específico por su ID (`tid`). |

#### Usuarios

> Todas las rutas de usuario requieren autenticación y rol `admin`.

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/users/` | Lista todos los usuarios registrados. |
| GET | `/api/users/:uid` | Devuelve un usuario por su ID (`uid`). |
| PATCH | `/api/users/:uid` | Actualiza los campos del usuario (nombre, apellido, rol). |

#### Autenticación

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/api/auth/login` | Login del usuario. |
| POST | `/api/auth/register` | Registro de un nuevo usuario. |
| GET | `/api/auth/logout` | Cierre de sesión del usuario. |
| GET | `/api/sessions/current` | Datos del usuario autenticado actual. |

---

### Vistas Disponibles

| Ruta | Descripción |
|------|-------------|
| `/` | Página principal de bienvenida. |
| `/products` | Catálogo de productos completo. |
| `/carts` | Vista de todos los carritos (requiere login). |
| `/carts/:cid` | Vista de un carrito específico del usuario. |
| `/guest-cart` | Vista del carrito local para invitados. |
| `/forms/add-product` | Formulario para agregar productos. |
| `/forms/delete-product` | Formulario para eliminar productos. |
| `/forms/edit-user` | Formulario para editar usuarios (solo administradores). |
| `/realtime/products` | Visualización en tiempo real de productos. |
| `/realtime/carts` | Visualización en tiempo real de carritos. |
| `/login` | Formulario de inicio de sesión. |
| `/register` | Formulario de registro de nuevos usuarios. |
| `/current` | Perfil del usuario autenticado. |
| `/admin` | Panel de administración para usuarios `admin`. |
| `/tickets` | Vista de tickets (sólo administradores). |

---

## Notas Adicionales

- **Autenticación JWT**: El token se almacena en `localStorage` y es renovado automáticamente cuando el usuario realiza acciones especificas para mantener la sesión viva.
- **Protección de Datos**: Los DTO ocultan campos sensibles como la fecha de nacimiento (`dateOfBirth`) y el identificador gubernamental (`gid`). Además, calculan automáticamente la edad (`age`) a partir de la fecha de nacimiento.
- **Carrito de Invitado**: Usuarios no autenticados tienen un carrito almacenado localmente en el navegador, sincronizado en la vista de carrito de invitado.
- **Control de Roles**: Acceso restringido a determinadas rutas y vistas según el rol (`user`, `admin`).
- **Websockets**: Las vistas de productos y carritos en tiempo real utilizan **Socket.IO** para actualizar dinámicamente los datos en pantalla.

---
