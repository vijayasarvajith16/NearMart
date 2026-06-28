NearMart – Local Vendor Marketplace

A full-stack MERN web application that empowers local vendors to sell online and helps buyers discover products from sellers in their city.

Problem Statement

Small local vendors — home bakers, handmade craft sellers, local farmers — have no affordable way to reach customers online. They rely on word-of-mouth or WhatsApp, 
which is unscalable and limits their growth. NearMart bridges this gap by providing a simple, accessible digital marketplace for local commerce.

Features

 Authentication & Roles
- Register as a **Buyer** or **Vendor**
- JWT-based secure login
- Role-based access control (Buyer / Vendor / Admin)
- Admin approval required before a vendor goes live

Vendor Store
- Create and manage a personal store profile
- Add, edit, and delete product listings
- Upload multiple product images (Multer + Cloudinary)
- Set product category, price, and stock quantity

Product Discovery
- Browse and search products by name or category
- Filter by city / pincode
- Detailed product page with images and vendor info

Cart & Orders
- Add to cart, update quantities, remove items
- Place orders with Cash on Delivery (COD)
- Real-time order status: `Pending → Confirmed → Delivered`
- Vendors can update order status from their dashboard

Dashboards
- Vendor:Total orders, revenue, top-selling products
- Buyer: Active orders, order history

Tech Stack
 Frontend : React.js, Tailwind CSS, Axios, React Router 
 Backend : Node.js, Express.js 
 Database: MongoDB, Mongoose |
 Authentication: JWT, bcrypt 
 File Uploads: Multer, Cloudinary 

# Auth
POST   /api/auth/register
POST   /api/auth/login

# Store
POST   /api/store              → Create store (Vendor)
GET    /api/store/:id          → Get store details
PUT    /api/store/:id          → Update store

# Products
POST   /api/products           → Add product (Vendor)
GET    /api/products           → Browse all products
GET    /api/products/:id       → Single product detail
PUT    /api/products/:id       → Edit product
DELETE /api/products/:id       → Delete product

# Cart
GET    /api/cart               → Get cart
POST   /api/cart/add           → Add item to cart
DELETE /api/cart/:productId    → Remove item from cart

# Orders
POST   /api/orders             → Place order
GET    /api/orders/buyer       → Buyer's order history
GET    /api/orders/vendor      → Vendor's incoming orders
PUT    /api/orders/:id/status  → Update order status (Vendor)


Scope & Future Improvements

- COD payment (current version)
- Razorpay / Stripe payment gateway integration
- GPS-based geospatial filtering (MongoDB 2dsphere)
- Real-time order notifications (Socket.io)
- Vendor ratings and reviews
