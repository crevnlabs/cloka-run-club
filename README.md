# CLOKA - Run Club App

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-15.2-black)](https://nextjs.org/)
[![Contributions Welcome](https://img.shields.io/badge/contributions-welcome-brightgreen.svg?style=flat)](CONTRIBUTING.md)


Cloka Run Club started as a grassroots weekend running group in Chennai, India aiming to bring fitness enthusiasts together through local runs followed by post-event networking and social activities. Over time, Cloka has grown into a multifaceted fitness hub, offering diverse activities and community engagement across India. Our mission is to foster a strong local fitness culture and build connections that extend beyond physical health.

![Banner](https://i.ibb.co/nsvFm62Q/image.png)

**Core Features**:

- **Local Community Engagement**: Runs are conducted every Saturday, paired with social events in partnership with local cafes and community spaces. This model encourages people to stay active and socialize, helping to strengthen local networks.
    
- **Cloka Chiefs**: Volunteer community leaders selected from across India are empowered to organize and host events, with access to a local instance of our Cloka Run Club app. This app helps them manage user registrations, event logistics, volunteer coordination, fitness tracking, and more.
    
- **App Features**: The Cloka app serves as a comprehensive platform that includes member management, event organization, fitness goals, tracking, ticketing, and a merch store. It supports a seamless experience for both users and event organizers, ensuring smooth communication and engagement.

![Image](https://i.ibb.co/twLGZ1Q7/image.png)
    
- **Open Source with MIT License**: The Cloka app is open-source, making it freely available for community contribution. This approach helps build an open ecosystem where other communities can use and contribute to the platform, expanding the reach of the Cloka movement.
    

**Impact**:

- **Local Public Good**: The app empowers individuals to take charge of their fitness journey while connecting them with local communities. By enabling local run clubs across India, Cloka fosters health and community cohesion, delivering measurable benefits on a neighborhood level. By providing the app for free under an MIT license, we ensure that anyone, anywhere, can start their own run club or fitness group with minimal cost. This scalability fosters a sustainable network of fitness communities that help improve health and well-being at the local level.
- **User Base and Growth**: The Cloka Run Club community boasts 11.5K Instagram followers and 3,500 app users, with active engagement in multiple cities. Every week 100 users get together for a Cloka run and post run activities in a region. This active user base is an indicator of the project's success and its potential to grow further. 
- **Community-driven**: Cloka's success hinges on community leadership and volunteerism, allowing us to make a meaningful impact at the neighborhood level. The app empowers local leaders (Cloka Chiefs) to host events and grow fitness communities in their respective regions.
- **Impact on Neighborhood Communities**:    Cloka addresses the challenge of disconnected neighborhoods by providing a free, accessible platform for fitness and social interaction. Unlike commercial fitness apps, Cloka prioritizes community over profit, offering tools that empower local leaders to create inclusive, hyper-local experiences—for example:

- A Chennai runner uses Cloka to register for a Saturday run, tracks their progress, and joins post-run networking at a local café.
- A Cloka Chief in a new city deploys the app to organize events, leveraging the open-source codebase to customize features for their community.

**Conclusion**: Cloka Run Club is not just an app; it’s a community-first initiative that brings people together, promotes fitness, and strengthens local neighborhoods. With the support of the Neighborhood Open Source Software Grant, we will be able to amplify our impact and help Cloka expand into more cities across India, creating a ripple effect of health and community building that benefits the neighborhoods at the core of this initiative.

Additional Information
- GitHub Repository: [https://github.com/crevnlabs/cloka-run-club].
- License: MIT License, ensuring open access and contribution.
- Team: Led by volunteer Cloka Chiefs and a small developer community, with no commercial backing.
- Media Coverage: Featured in The Hindu for its innovative approach to community fitness.
- Social Proof: 11.5K Instagram followers and growing user base reflect strong community trust. [https://www.instagram.com/cloka.club/]




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
