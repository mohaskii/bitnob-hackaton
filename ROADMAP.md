# Market Platform Feature Roadmap

The platform focuses on live-commerce (live streaming with integrated shopping). Below is a well-ordered list of features we need to implement, indicating our current progress:

### Phase 1: Core Foundation & Infrastructure
- [x] **Project Scaffolding:** Preact, Vite, TailwindCSS, and Capacitor setup.
- [x] **Basic Feed UI:** Infinite scroll or standard feed layout for discovering content.
- [x] **Live Streaming PoC (Android):** Basic seller broadcasting via custom Capacitor plugin.
- [x] **Buyer Viewing Interfaces:** HLS and FLV players integrated for consuming live video.
- [ ] **Cross-Platform Parity:** Port the `CameraStreamPlugin` to iOS.

### Phase 2: User Accounts & Profiles
- [ ] **Authentication:** User registration, login, and secure session management.
- [ ] **Role Management:** Differentiating between Buyers and Sellers.
- [ ] **User Profiles:** Displaying user details, profile pictures, and past streams/orders.

### Phase 3: E-commerce & Checkout Flow
- [ ] **Product Catalog:** Ability for sellers to add, edit, and delete products.
- [ ] **Live Inventory:** Linking products to active live streams.
- [ ] **Shopping Bag/Cart:** Persistent cart state for buyers.
- [ ] **Checkout Process:** Secure payment integration (e.g., Stripe, PayPal, or Local Mobile Money).
- [ ] **Order Management:** Tracking orders for buyers and fulfillment dashboards for sellers.

### Phase 4: Social & Interactive Live Features
- [ ] **Real-time Chat:** WebSocket-based chat system for buyers to interact during a live stream.
- [ ] **Reactions & Likes:** Floating emojis or likes over the video player.
- [ ] **Live Overlay:** Floating products during the stream for quick 1-click purchases.

### Phase 5: Retention & Discovery
- [ ] **Push Notifications:** Alerting followers when a seller goes live.
- [ ] **Search & Filtering:** Finding specific products, categories, or active streams.
- [ ] **Analytics Dashboard:** Providing sellers with metrics on viewership, engagement, and sales.
