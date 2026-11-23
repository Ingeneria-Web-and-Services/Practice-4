# Practice 4 – DriveDeal (Front-End Development II: CSR with Next.js + Tailwind CSS)

DriveDeal is a car marketplace built with Next.js and MongoDB.
The products sold are cars.

Authors: see `authors.txt`. Requirements and run instructions: see `requirements.txt`.

## Environment variables

The `.env*` files are not in the repository (they are listed in `.gitignore`),
so every developer must create their own **`.env.local`** in the project root
before running the app:

```env
MONGODB_URI=mongodb://127.0.0.1:27017/drivedeal
SESSION_SECRET=replace-with-a-long-random-string
```

| Variable | Required | Description |
| -------- | -------- | ----------- |
| `MONGODB_URI` | yes | Connection string of the MongoDB database. `drivedeal` is the database name; change host/port if your MongoDB runs elsewhere. |
| `SESSION_SECRET` | yes | Key used to sign the session JWT (HS256). Use a long random string (at least 32 characters) and never share or commit it. |

A random secret can be generated with:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Optionally, a `.env` file with `NEXT_TELEMETRY_DISABLED=1` turns off Next.js
telemetry.

Changing `SESSION_SECRET` invalidates all existing sessions (users must sign in
again). Changing the database name in `MONGODB_URI` requires running
`npm run seed` again.

## Run

```bash
npm install
npm run seed
npm run dev
```

The seeder prints the IDs of the two sample users and the sample cars.

| User | E-mail | Password |
| ---- | ------ | -------- |
| John Doe | `johndoe@example.com` | `1234` |
| Jane Smith | `janesmith@example.com` | `5678` |

Passwords are stored hashed with bcrypt. `SESSION_SECRET` (used to sign the
JWT) is defined in `.env.local`.

## Authentication and authorization

- `POST /api/auth/signin` checks e-mail + password and, on success, sets the
  `session` cookie (JWT signed with HS256, `httpOnly`, valid 7 days).
- `POST /api/auth/signout` removes the cookie (204).
- Every endpoint under `/api/users/[userId]/...` requires a signed-in user and
  the `userId` of the URL must be the signed-in user. Checks, in this order:
  **401** `NOT_AUTHENTICATED` (no valid session) -> **400** `WRONG_PARAM`
  (invalid ID) -> **403** `NOT_AUTHORIZED` (another user's resources).
  The logic lives in `src/lib/authorization.ts`.
- Public endpoints: products, user registration, sign in and sign out.

## REST API

| Method | Path | Auth | Success | Errors |
| ------ | ---- | ---- | ------- | ------ |
| POST | `/api/auth/signin` | public | 200 + session cookie | 400 missing params / wrong credentials |
| POST | `/api/auth/signout` | public | 204 | – |
| GET | `/api/products` | public | 200 | – |
| GET | `/api/products/[productId]` | public | 200 | 400 invalid product ID, 404 product not found |
| POST | `/api/users` | public | 201 + `Location` | 400 invalid body / e-mail already in use |
| GET | `/api/users/[userId]` | owner | 200 | 401, 400 invalid user ID, 403, 404 user not found |
| GET | `/api/users/[userId]/cart` | owner | 200 | 401, 400, 403, 404 |
| PUT | `/api/users/[userId]/cart/[productId]` | owner | 200 updated / 201 created + `Location` | 401, 400 invalid user ID / product ID / qty, 403, 404 user / product not found |
| DELETE | `/api/users/[userId]/cart/[productId]` | owner | 200 | 401, 400 invalid user ID / product ID, 403, 404 |
| GET | `/api/users/[userId]/orders` | owner | 200 | 401, 400, 403, 404 |
| POST | `/api/users/[userId]/orders` | owner | 201 + `Location` | 401, 400 invalid user ID / body / empty cart, 403, 404 |
| GET | `/api/users/[userId]/orders/[orderId]` | owner | 200 | 401, 400 invalid user ID / order ID, 403, 404 user / order not found |

Every error response has the form `{ "error": "...", "message": "..." }`.

## Testing with Postman

Run `npm run seed`, import
`postman/DriveDeal.postman_collection.json` and run the whole
collection in order. Postman keeps the session cookie automatically and every
request has a test for the expected status code.

## Practice 1: data model and REST API

### Data model (Mongoose, `src/models/`)

**Product** (`Product.ts`) – a car:

| Field | Type | Notes |
| ----- | ---- | ----- |
| `name`, `description`, `img` | string | required |
| `price` | number | >= 0 |
| `brand`, `model`, `bodyType`, `color` | string | required |
| `year` | number | >= 1900 |
| `kilometers`, `powerHp`, `numberOfOwners` | number | >= 0 |
| `fuelType` | string | `Petrol`, `Diesel`, `Electric` or `Hybrid` |
| `transmission` | string | `Manual` or `Automatic` |
| `doors`, `seats` | number | >= 1 |
| `accidentFree`, `used` | boolean | required |

**User** (`User.ts`):

| Field | Type | Notes |
| ----- | ---- | ----- |
| `email` | string | required, unique |
| `password` | string | stored hashed with bcrypt |
| `name`, `surname`, `address` | string | required |
| `birthdate` | Date | required |
| `cartItems` | `{ product, qty }[]` | `product` references a Product, `qty >= 1` |
| `orders` | ObjectId[] | references to the user's Orders |

**Order** (`Order.ts`):

| Field | Type | Notes |
| ----- | ---- | ----- |
| `address` | string | shipping address |
| `date` | Date | set by the server when the order is created |
| `cardHolder`, `cardNumber` | string | payment data |
| `orderItems` | `{ product, qty, price }[]` | `price` = price of the product at the time of purchase |

### Seeder (`db/seeder.ts`)

`npm run seed`:

1. Drops the database and creates the empty `products`, `users` and `orders`
   collections.
2. Inserts 5 sample cars (VW Golf 8 GTI, Renault Clio 5, Tesla Model 3,
   BMW 320d Touring, VW Golf 4 Variant).
3. Inserts 2 sample users with hashed passwords (John Doe with 2 cars in the
   cart, Jane Smith with 1 car in the cart). No orders are created.
4. Prints the IDs of the new users and products (they change every time the
   seeder runs).

### REST API implementation

- Every endpoint has a `route.ts` file in `src/app/api/...` (Next.js App
  Router). The route checks the parameters and the request body and returns
  the status code and headers described in the REST API table above.
- The database logic is in `src/lib/handlers.ts`: one handler per operation
  (`getProducts`, `getProduct`, `createUser`, `getUser`, `getCart`,
  `putCartItem`, `deleteCartItem`, `getOrders`, `getOrder`, `createOrder`),
  each with a TypeScript interface for its result.
- Business rules:
  - `POST /api/users` returns 400 if the e-mail is already in use; the new user
    starts with an empty cart and no orders.
  - `PUT .../cart/[productId]` only accepts `qty >= 1` (201 if the product was
    not in the cart, 200 if it was updated). To remove a product, `DELETE` is
    used.
  - `POST .../orders` uses the current date, copies every cart item into an
    order item with the current price of the product, adds the order to the
    user and clears the cart. An empty cart returns 400.
- The database connection is in `src/lib/mongoose.js` (reused between
  requests).

## Practice 2: authentication and authorization

- Passwords are hashed with bcrypt when a user is created (`createUser`) and in
  the seeder; `checkCredentials` compares the password with `bcrypt.compare`.
- Sessions (`src/lib/auth.ts`): after a successful sign in, a JWT with the
  `userId` is signed with `SESSION_SECRET` (HS256, valid 7 days) and stored in
  the `session` cookie (`httpOnly`, `secure`, `sameSite: lax`).
  `getSession()` reads and verifies it, `deleteSession()` removes it.
- Authorization (`src/lib/authorization.ts`): `authorizeUser(userId)` is
  called at the start of every `/api/users/[userId]/...` handler (except
  `POST /api/users`, which is public). It returns 401 without a valid session,
  400 for an invalid ID and 403 when the ID is not the signed-in user.
- `POST /api/auth/signin` only accepts string values for `email` and `password`
  (prevents NoSQL injection such as `{ "$ne": null }`).
- Tested with the Postman collection (`postman/`), in this order: setup and
  public endpoints, requests without signing in (401), signed in as John (200),
  John accessing Jane's resources (403), sign out.

## Practice 3: pages (server-side rendering)

All pages are **Server Components** styled with Tailwind CSS. They read the
data directly with the handlers in `src/lib/handlers.ts` (no REST requests)
and the signed-in user with `getSession()`.

### Layouts and folder structure (`src/app/`)

| File | Description |
| ---- | ----------- |
| `layout.tsx` | Root layout: Inter font, global styles and page title "DriveDeal". |
| `(sections)/layout.tsx` | Layout of the main sections: `Navbar`, `Header`, the page content and `Footer`. The route group `(sections)` does not appear in the URL. |
| `auth/layout.tsx` | Layout of `/auth/signin` and `/auth/signup`: centred content, **without** navbar, header or footer. |

### Sections

| Route | File | Content |
| ----- | ---- | ------- |
| `/` | `(sections)/page.tsx` | Responsive grid of all cars (1 column on mobile, 2 / 3 / up to 4 on larger screens). Each tile shows image, name and price and links to the product page. |
| `/products/[productId]` | `(sections)/products/[productId]/page.tsx` | Image, name, price, description and a table with all car details (brand, model, year, mileage, fuel, transmission, power, body type, colour, doors, seats, previous owners, accident-free, new/used). Includes the quantity selector with the current quantity in the cart; it is disabled when the user is not signed in. Invalid or unknown ID -> 404. |
| `/cart` | `(sections)/cart/page.tsx` | Table with image, name, quantity, unit price and total per product, plus the total of the cart. Each product links to its page. Quantity selector (+ / − / remove) per product and a "Check out" button. Empty cart -> message "The cart is empty" and no checkout button. |
| `/checkout` | `(sections)/checkout/page.tsx` | Same table as the cart, but without the quantity buttons, plus the purchase form (shipping address, card holder, card number). Empty cart -> message and no form. |
| `/orders/[orderId]` | `(sections)/orders/[orderId]/page.tsx` | Order ID, shipping address, payment information and date of purchase, followed by the table of the ordered products with the price at the moment of the purchase. Orders of another user, invalid or unknown IDs -> 404. |
| `/profile` | `(sections)/profile/page.tsx` | Full name, e-mail, address and birthdate of the user, and a table of the user's orders (ID, shipping address, payment information). Each order links to its details page. No orders -> "You have not made any purchase yet". |
| `/auth/signin`, `/auth/signup` | `auth/...` | Placeholders in Practice 3 (sign in is implemented in Seminar 4, sign up in Practice 4). |

`/cart`, `/checkout`, `/orders/[orderId]` and `/profile` redirect to
`/auth/signin` when the user is not signed in (or when the user of the session
no longer exists, e.g. after running the seeder again).

### Components (`src/components/`)

| Component | Used in | Description |
| --------- | ------- | ----------- |
| `Navbar` | all sections | Logo and name. Signed in: cart, profile and sign-out buttons. Not signed in: "Sign up" and "Sign in" links. |
| `NavbarButton` | `Navbar` | Round icon button (link) with shared styles (`navbarButtonClasses`). |
| `Header` | all sections | Red banner with the title "DriveDeal" and the slogan. |
| `Footer` | all sections | Copyright line at the bottom of the page. |
| `PageTitle` | all sections | Title of each page. |
| `ProductTile` | `/` | Image, name and price of a car, linking to its page. |
| `ItemsTable` | `/cart`, `/checkout`, `/orders/[orderId]` | Table of products (image, name, quantity, unit price, total) and total price. With `editable` it shows the quantity selector (cart only). |
| `QuantitySelector` | `/products/[productId]`, `/cart` | − / quantity / + / remove buttons. In Practice 3 the buttons had no functionality. |
| `InfoList` | `/profile`, `/orders/[orderId]` | List of "icon + label: value" rows. |
| `PurchaseForm` | `/checkout` | Shipping address, card holder and card number (13–23 digits). In Practice 3 submitting the form does not make a purchase yet. |

Helpers in `src/lib/format.ts`: `formatPrice` (prices in euros),
`formatDate` and `formatDateTime`. Icons: `@heroicons/react`.

### Signing in during Practice 3

Since the sign-in page did not exist yet, the session was created from the
browser console (DevTools) with `fetch` requests to `POST /api/auth/signin`
and `POST /api/auth/signout` (Seminar 3, slide 26). The seeder creates no
orders, so orders were created with Postman (`POST /api/users/[userId]/orders`)
to test `/profile` and `/orders/[orderId]`.

## Practice 4: client-side rendering

### Sign-in page

- `/auth/signin` (`src/app/auth/signin/page.tsx`) shows the sign-in form.
- `SignInForm` (`src/components/SignInForm.tsx`) is a Client Component. It keeps
  the form values and the error message in `useState`, validates the fields in
  the browser (`checkValidity()` + Tailwind `invalid:` / `peer-` styles) and
  sends `POST /api/auth/signin`.
- On success the user is redirected to `/` (`router.push('/')` +
  `router.refresh()`). With a wrong e-mail or password the message
  "Wrong e-mail or password." is shown.
- The "Sign in" button in the navbar opens this page.

### Cart counter

- `QuantitySelector` (`src/components/QuantitySelector.tsx`, called
  `CartItemCounter` in the seminar) is now a Client Component with three
  buttons:
  - **+** sends `PUT /api/users/[userId]/cart/[productId]` with `qty + 1`.
  - **−** sends `PUT` with `qty - 1`; when the quantity would become 0 it sends
    `DELETE` instead, because the API only accepts `qty >= 1`.
  - **Remove** (trash icon) sends `DELETE /api/users/[userId]/cart/[productId]`.
- While a request is running the buttons are disabled (`isUpdating` state).
  After it finishes, `router.refresh()` reloads the Server Components, so the
  cart, the totals and the navbar badge show the new values.
- The counter is used on the product page (`/products/[productId]`, disabled
  when the user is not signed in) and in the shopping cart (`/cart`, through
  `ItemsTable`).
- Client Components cannot read the `httpOnly` session cookie, so `userId` is
  read in the Server Component pages (`getSession()`) and passed down as a prop.
- With several tabs open, the other tabs are not updated automatically: they
  show the old quantity until they are refreshed, and clicking + / − there uses
  the old value.

### Shopping cart badge

- `NavbarCartButton` (`src/components/NavbarCartButton.tsx`) is a Server
  Component that replaces the cart button in the navbar. It reads the cart of
  the signed-in user and shows the total number of items (sum of all
  quantities) in a red badge.

### React hooks example

- `src/components/SampleClientComponent.tsx` contains the `useState` /
  `useEffect` examples from the seminar. It is not rendered on any page.

### Not implemented yet

- Sign up page (`/auth/signup`) is still a placeholder.
- The sign-out button in the navbar does not work yet.