# CLOKA - Run Club App

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-15.2-black)](https://nextjs.org/)
[![Contributions Welcome](https://img.shields.io/badge/contributions-welcome-brightgreen.svg?style=flat)](CONTRIBUTING.md)

A premium clothing brand website with Razorpay integration for the official merch store and seamless run registrations.

## Features

- **Luxury Black and White Theme** - Elegant design with a focus on typography and clean aesthetics.
- **Seamless Run Registrations** - No more DMs or manual lists. Register for runs directly through the website.
- **Official Cloka Merch Store** - Powered by Razorpay for secure payments.
- **Runner of the Week Feature** - Spotlighting standout community members.
- **Cloka's Story** - A dedicated section sharing the club's journey and mission.
- **Upcoming Events & Run Updates** - Keeping the community in the loop.
- **Admin Dashboard** - Password-protected admin area to view and manage registrations.

## Tech Stack

- **Next.js** - React framework for server-rendered applications
- **TypeScript** - For type safety and better developer experience
- **Tailwind CSS** - For styling
- **Framer Motion** - For animations
- **React Hook Form** - For form handling
- **Zod** - For form validation
- **Razorpay** - For payment processing
- **MongoDB** - For database storage
- **Mongoose** - ODM for MongoDB

## Getting Started

### Prerequisites

- Node.js 18.x or higher
- npm or yarn
- MongoDB connection (local or Atlas)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/fabianferno/cloka-app.git
   cd cloka-app
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Create a `.env.local` file in the root directory with your Razorpay API keys, MongoDB connection string, and admin credentials:
   ```
   RAZORPAY_KEY_ID=your_key_id
   RAZORPAY_KEY_SECRET=your_key_secret
   NEXT_PUBLIC_RAZORPAY_KEY_ID=your_key_id
   MONGODB_URI=your_mongodb_connection_string
   ADMIN_PASSWORD=your_admin_password
   ADMIN_AUTH_TOKEN=your_admin_auth_token
   ```

4. Download placeholder images:
   ```bash
   npm run download-images
   # or
   yarn download-images
   ```

5. Seed the database with initial data:
   ```bash
   npm run seed-db
   # or
   yarn seed-db
   ```

6. Run the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

7. Open [http://localhost:3000](http://localhost:3000) in your browser to see the result.

## MongoDB Setup

This project uses MongoDB to store run registrations, product information, orders, and more. You can set up MongoDB in two ways:

### Option 1: MongoDB Atlas (Recommended for production)

1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster
3. Set up database access with a username and password
4. Set up network access (allow access from anywhere for development)
5. Get your connection string from the "Connect" button
6. Replace `<username>`, `<password>`, and `<dbname>` in the connection string
7. Add the connection string to your `.env.local` file as `MONGODB_URI`

### Option 2: Local MongoDB (For development)

1. Install MongoDB Community Edition on your machine
2. Start the MongoDB service
3. Use the connection string `mongodb://localhost:27017/cloka` in your `.env.local` file

## Admin Access

The application includes a password-protected admin area to view and manage registrations.

### Setting Up Admin Access

1. In your `.env.local` file, set the following variables:
   ```
   ADMIN_PASSWORD=your_chosen_password
   ADMIN_AUTH_TOKEN=a_random_secure_string
   ```
   
   The `ADMIN_PASSWORD` is what you'll use to log in, and the `ADMIN_AUTH_TOKEN` is used internally for session management.
   
   For security, use a strong password and a random string for the auth token. You can generate a random string using:
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

2. Restart your development server if it's already running.

### Accessing the Admin Area

1. Navigate to `/admin/login` in your browser
2. Enter the password you set in the `ADMIN_PASSWORD` environment variable
3. Upon successful authentication, you'll be redirected to the registrations dashboard

### Admin Features

- **View Registrations**: See all run registrations in a tabular format
- **Filter Data**: Filter registrations by gender and crew membership status
- **Pagination**: Navigate through large sets of registration data
- **Responsive Design**: Access the admin dashboard from any device

### Security Notes

- The admin area is protected by middleware that checks for a valid authentication cookie
- All admin API endpoints are similarly protected
- Passwords are never stored in the database, only compared against the environment variable
- Session cookies are HTTP-only for security

## Database Models

The application uses the following data models:

- **Registration** - For storing run registrations
- **Product** - For storing merchandise products
- **Order** - For tracking Razorpay orders
- **Event** - For upcoming runs and events

## Deployment

The easiest way to deploy this app is to use the [Vercel Platform](https://vercel.com/new) from the creators of Next.js.

When deploying, make sure to set all the environment variables in your hosting platform's dashboard.

## Razorpay Integration

This project uses Razorpay for payment processing. To test the payment flow:

1. Create a Razorpay account at [https://razorpay.com](https://razorpay.com)
2. Get your API keys from the Razorpay Dashboard
3. Update the `.env.local` file with your API keys
4. Use the test mode to simulate payments

## Contributing

We love your input! We want to make contributing to CLOKA as easy and transparent as possible. Please read our [Contributing Guidelines](CONTRIBUTING.md) to get started.

### Code of Conduct

This project and everyone participating in it is governed by the [CLOKA Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code.

### Development Process

We use GitHub to host code, to track issues and feature requests, as well as accept pull requests. We use [Github Flow](https://guides.github.com/introduction/flow/index.html), so all code changes happen through pull requests.

1. Fork the repo and create your branch from `main`
2. If you've added code that should be tested, add tests
3. If you've changed APIs, update the documentation
4. Ensure the test suite passes
5. Make sure your code lints
6. Issue that pull request!

See the [Contributing Guidelines](CONTRIBUTING.md) for more details.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
