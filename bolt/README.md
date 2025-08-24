# Anamola Political Party Website

A modern, production-ready political party website with member registration, payment processing, and administrative dashboard.

## 🚀 Features

- **User Authentication**: Secure Supabase-based authentication system
- **Member Registration**: Complete registration flow with Stripe payment integration
- **Member Dashboard**: Personalized dashboard for party members
- **Admin Dashboard**: Comprehensive administrative tools for party management
- **News Management**: Create, edit, and manage news articles
- **Event Management**: Organize and manage party events
- **Payment Processing**: Secure Stripe integration for membership fees
- **Responsive Design**: Mobile-first, modern UI/UX

## 🏗️ Architecture

The application follows a clean, scalable architecture:

```
src/
├── components/          # Reusable UI components
├── pages/              # Page components
├── services/           # Business logic and API calls
├── middleware/         # Validation and utility functions
├── models/             # Data models and types
├── utils/              # Helper functions
├── tests/              # Unit tests
└── context/            # React context providers
```

## 🛠️ Tech Stack

### Frontend
- **React 18** - Modern React with hooks
- **React Router** - Client-side routing
- **CSS3/SCSS** - Styling with modern CSS features

### Backend
- **Node.js** - Server runtime
- **Express.js** - Web framework
- **Supabase** - Database and authentication
- **Stripe** - Payment processing

### Testing
- **Jest** - Testing framework
- **React Testing Library** - Component testing
- **Coverage Reports** - Code coverage analysis

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account
- Stripe account

### Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd anamola-website
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   Create a `.env` file in the root directory:
   ```env
   # Supabase Configuration
   SUPABASE_URL=your_supabase_url
   SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_KEY=your_supabase_service_key
   
   # Stripe Configuration
   STRIPE_SECRET_KEY=your_stripe_secret_key
   STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
   
   # Frontend Configuration
   REACT_APP_SUPABASE_URL=your_supabase_url
   REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
   REACT_APP_API_URL=http://localhost:5000
   
   # Server Configuration
   PORT=5000
   NODE_ENV=development
   ```

4. **Database Setup**
   Run the SQL script in your Supabase database:
   ```bash
   # Execute the SQL script in Supabase SQL editor
   # This creates all necessary tables and policies
   ```

## 🚀 Running the Application

### Development Mode
```bash
# Start both frontend and backend
npm run dev

# Or start them separately
npm run server    # Backend on port 5000
npm start         # Frontend on port 3000
```

### Production Mode
```bash
# Build the frontend
npm run build

# Start the production server
NODE_ENV=production npm run server
```

## 🧪 Testing

### Run Tests
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Test Coverage
The application maintains 80%+ test coverage across:
- Authentication services
- API services
- Validation utilities
- Component functionality

## 📚 API Documentation

### Authentication Endpoints
- `POST /api/register` - User registration
- `POST /api/login` - User login
- `POST /api/logout` - User logout
- `GET /api/user` - Get current user

### Member Endpoints
- `GET /api/member/dashboard` - Member dashboard data

### Admin Endpoints
- `GET /api/admin/stats` - Admin statistics
- `GET /api/admin/users` - User management
- `GET /api/admin/news` - News management
- `GET /api/admin/events` - Event management

### Payment Endpoints
- `POST /api/create-checkout-session` - Create Stripe checkout
- `POST /api/payment-success` - Handle payment success

## 🔒 Security Features

- **JWT Authentication** - Secure token-based authentication
- **Role-Based Access Control** - Admin and member permissions
- **Input Validation** - Comprehensive form validation
- **SQL Injection Protection** - Parameterized queries
- **CORS Configuration** - Cross-origin request handling

## 📱 Responsive Design

The application is built with a mobile-first approach:
- Responsive grid layouts
- Touch-friendly interfaces
- Optimized for all device sizes
- Progressive Web App features

## 🚀 Performance Optimizations

- **Code Splitting** - Lazy loading of components
- **Image Optimization** - Compressed and optimized images
- **Bundle Analysis** - Optimized bundle sizes
- **Caching Strategies** - Efficient data caching

## 🔧 Development Tools

- **ESLint** - Code quality and consistency
- **Prettier** - Code formatting
- **Husky** - Git hooks for quality checks
- **Concurrently** - Run multiple commands simultaneously

## 📊 Monitoring & Analytics

- **Error Tracking** - Comprehensive error logging
- **Performance Monitoring** - Core Web Vitals tracking
- **User Analytics** - User behavior insights
- **Server Monitoring** - Backend performance tracking

## 🚀 Deployment

### Environment Variables
Ensure all environment variables are set in your production environment.

### Database Migration
Run the database setup script in your production Supabase instance.

### Build Process
```bash
npm run build
npm run server
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

## 🔄 Changelog

### Version 2.0.0 (Current)
- Complete codebase refactor
- Production-ready architecture
- Comprehensive testing suite
- Enhanced security features
- Performance optimizations

### Version 1.0.0
- Initial release
- Basic functionality
- Member registration
- Payment integration
