# ShopSphere — Microservices-Based E-Commerce Application

A complete, end-to-end e-commerce platform built with a **Microservices Architecture**, **Node.js/Express**, **MongoDB**, **React**, and **Tailwind CSS**.

## Architecture Diagram

```text
[ React + Tailwind Frontend :5173 ]
                 │
                 ▼ (REST + JWT Bearer Token)
        [ API Gateway :5000 ]
          ├──► /api/users/*         ──► [ User Service :5001 ]         (shopsphere_users)
          ├──► /api/products/*      ──► [ Product Service :5002 ]      (shopsphere_products)
          ├──► /api/cart/*          ──► [ Cart Service :5003 ]         (shopsphere_carts)
          ├──► /api/orders/*        ──► [ Order Service :5004 ]        (shopsphere_orders)
          ├──► /api/payments/*      ──► [ Payment Service :5005 ]      (shopsphere_payments)
          └──► /api/notifications/* ──► [ Notification Service :5006 ] (shopsphere_notifications)
```

## Microservices Overview

1. **API Gateway (`:5000`)**: Single entry point, JWT authentication middleware, header injection (`x-user-id`, `x-user-role`), reverse proxy routing, and `503` service-unavailable handling.
2. **User Service (`:5001`)**: User registration, `bcryptjs` password hashing, JWT token generation, login, and profile/address management.
3. **Product Service (`:5002`)**: Product CRUD, search & category filters, stock reservation, and database seeder.
4. **Cart Service (`:5003`)**: Persistent per-user shopping cart, stock validation via Product Service, quantity updates, and subtotal/18% tax/shipping calculation.
5. **Order Service (`:5004`)**: Order creation with unique IDs (`ORD-...`), stock reservation, cart clearing, order history, cancellation, and status updates.
6. **Payment Service (`:5005`)**: Simulated card/UPI/wallet payment approval or decline, transaction records (`TXN-...`), order payment sync, and notification dispatch.
7. **Notification Service (`:5006`)**: In-app notification feed and read/unread state for order creation, payment outcomes, order status updates, and cancellations.

## Localhost Setup (VS Code)

### Prerequisites
- **Node.js** (v18+ or v20+) and **npm**
- **MongoDB** running locally (`mongodb://127.0.0.1:27017`) OR **Docker & Docker Compose**

### Option A: Run Locally on Node.js + MongoDB
1. Open the `shopsphere` folder in VS Code.
2. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
3. Install dependencies across all workspaces:
   ```bash
   npm run install:all
   ```
4. Seed initial sample products:
   ```bash
   npm run seed
   ```
5. Start all microservices, API Gateway, and Frontend together:
   ```bash
   npm run dev
   ```
6. Open **http://localhost:5173** in your browser.

### Option B: Run with Docker Compose
```bash
docker compose up --build
```

## API Endpoints (via API Gateway `http://localhost:5000/api`)

- `POST /users/register` — Register user (`admin@shopsphere.com` gets `admin` role)
- `POST /users/login` — Authenticate and receive JWT
- `GET /users/profile` & `PUT /users/profile` — Get/update profile
- `GET /products` & `GET /products/:id` — List/filter/search products & view details
- `POST /products`, `PUT /products/:id`, `DELETE /products/:id` — Admin product management
- `GET /cart`, `POST /cart/add`, `PUT /cart/item/:productId`, `DELETE /cart/item/:productId`, `DELETE /cart/clear` — Cart operations
- `POST /orders`, `GET /orders/my-orders`, `GET /orders/all`, `PATCH /orders/:orderId/status`, `PATCH /orders/:orderId/cancel` — Order lifecycle
- `POST /payments/simulate`, `GET /payments/my-payments` — Payment simulation & history
- `GET /notifications`, `PATCH /notifications/:id/read`, `PATCH /notifications/read-all` — Notifications

## Screenshots
Add screenshots of your running app (`HomePage`, `ProductsPage`, `CartPage`, `CheckoutPage`, `OrdersPage`, and `AdminDashboardPage`) under `docs/screenshots/` before publishing to GitHub.

## Troubleshooting
- **MongoDB connection refused**: Ensure the `mongod` service is running on port `27017` or start MongoDB via Docker Compose.
- **Port already in use (`EADDRINUSE`)**: Stop any process occupying ports `5000–5006` or `5173`.
- **401 Unauthorized**: Ensure you are logged in and sending `Authorization: Bearer <token>`.
