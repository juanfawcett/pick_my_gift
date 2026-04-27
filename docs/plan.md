# Plan de Desarrollo: App de Regalos Baby Shower Scarlett

## 1. Configuración del Proyecto

- Inicializar proyecto Next.js con React, TypeScript y Tailwind CSS.
- Configurar Shadcn UI para usar componentes preconstruidos y accesibles (botones, modales, barras de navegación, etc.).
- Configurar base de datos NoSQL: Usaremos **MongoDB Atlas** (con Mongoose). Es gratuita, potente, sin servidor y se integra perfectamente con Vercel.
- Definir la estructura de carpetas (App Router de Next.js).

## 2. Modelado de Datos

- **Usuario (User):** Nombre, Celular, Rol (Admin/Invitado). Si el celular es "3013887536", se le asigna rol 'admin'.
- **Regalo (Gift):** Nombre, Descripción, Precio, Fotos (URLs), URL MercadoLibre, Stock, Estado (Disponible, No disponible).
- **Transacción (Transaction):** Referencia al Usuario, Referencia a los Regalos seleccionados (con cantidades), Total, Fecha.

## 3. Desarrollo de Componentes y Páginas (Frontend)

- **Páginas Principales:**
  - `/` (Home/Login): Pantalla simple de ingreso con Nombre y Celular.
  - `/regalos`: Listado de regalos disponibles.
  - `/carrito`: Resumen de la selección y confirmación.
  - `/admin`: Panel de administrador para crear/editar/eliminar regalos.
- **Componentes Clave:**
  - **Navbar:** Título "Baby shower de Scarlett", saludo al usuario, botón de administrador (si tiene acceso) y carrito con contador.
  - **GiftCard:** Tarjeta de regalo en el listado mostrando detalles principales y si está agotado (escala de grises).
  - **GiftModal:** Modal de detalle del regalo.
  - **CartItem:** Elemento de la lista en la vista del carrito.

## 4. Funcionalidades y Endpoints (Backend - Next.js Route Handlers / Server Actions)

- **Autenticación (Simple):**
  - Validar/crear usuario. Si el celular es "3013887536", crear con rol `admin`.
- **Gestión y Scraping de Regalos (Admin):**
  - Al ingresar un link de MercadoLibre, el backend obtendrá automáticamente el nombre, precio y fotos del producto.
  - Guardar o editar la información raspada y actualizar inventario.
- **Carrito y Transacciones:**
  - Endpoint para registrar la transacción. Debe verificar el stock disponible, registrar la orden, y actualizar el stock del regalo (si llega a 0, cambiar estado a No disponible).

## 5. Flujo de Usuario (MVP)

1. Usuario ingresa Nombre y Celular.
2. Si no existe, se crea en la BD. Si existe, se loguea.
3. Entra a la vista de regalos.
4. Explora y abre el detalle de los regalos que le interesan.
5. Añade al carrito seleccionando la cantidad.
6. Va al carrito, revisa el total y pulsa "Confirmar Regalos".
7. El sistema verifica stock, procesa y manda al usuario de vuelta a la lista principal (los regalos sin stock se verán en gris con mensaje de "Regalo seleccionado").

## 6. Despliegue

- Desplegar en Vercel. Next.js maneja nativamente tanto el frontend como el backend (API routes) en el mismo dominio, por lo que no es necesario separar el build de forma manual. Todo correrá fluidamente bajo la infraestructura serverless de Vercel.

---

**Preguntas para confirmar:**

1. ¿Qué plataforma de base de datos NoSQL prefieres? (MongoDB Atlas, Vercel KV, Firebase, etc.)
2. ¿Cómo tienes pensado manejar subir las fotos de los regalos? (Podemos usar URLs públicas o servicios como AWS S3 / Vercel Blob).
3. Para el usuario administrador, ¿basta con tener un campo `role: 'admin'` en la base de datos y un panel oculto (`/admin`) para que pueda crear los regalos?
