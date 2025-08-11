# Backend Authentication System

A complete authentication system with Express.js, MongoDB, JWT, and Google OAuth.

## Features

- ✅ User registration and login
- ✅ Google OAuth authentication
- ✅ JWT access and refresh tokens
- ✅ Password hashing with bcrypt
- ✅ Input validation with express-validator
- ✅ Rate limiting
- ✅ CORS configuration
- ✅ Security headers with helmet
- ✅ Comprehensive error handling
- ✅ MongoDB integration with Mongoose
- ✅ Token refresh mechanism
- ✅ User profile management

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or cloud)
- Google OAuth credentials

## Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   Copy `config.env` and update the values:
   ```bash
   # Update config.env with your values
   MONGODB_URI=your-mongodb-connection-string
   JWT_SECRET=your-super-secret-jwt-key
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   ```

3. **Set up Google OAuth:**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing one
   - Enable Google+ API
   - Create OAuth 2.0 credentials
   - Add authorized redirect URIs: `http://localhost:3000/api/auth/google/callback`

4. **Start the server:**
   ```bash
   npm start
   # or for development
   npm run dev
   ```

## API Endpoints

### Authentication Routes

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/api/auth/signup` | Register new user | Public |
| POST | `/api/auth/login` | Login user | Public |
| POST | `/api/auth/logout` | Logout user | Private |
| POST | `/api/auth/refresh` | Refresh access token | Public |
| GET | `/api/auth/me` | Get current user | Private |
| GET | `/api/auth/google` | Google OAuth login | Public |
| GET | `/api/auth/google/callback` | Google OAuth callback | Public |

### User Routes

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/users` | Get all users | Private (Admin) |
| GET | `/api/users/:id` | Get user by ID | Private |
| PUT | `/api/users/:id` | Update user | Private |
| DELETE | `/api/users/:id` | Delete user | Private (Admin) |

## Request Examples

### Signup
```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123"
  }'
```

### Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

### Protected Route
```bash
curl -X GET http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Refresh Token
```bash
curl -X POST http://localhost:3000/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "YOUR_REFRESH_TOKEN"
  }'
```

## Response Format

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": {
    "user": {
      "id": "user_id",
      "name": "John Doe",
      "email": "john@example.com",
      "avatar": "avatar_url",
      "role": "user",
      "isEmailVerified": true,
      "lastLogin": "2023-01-01T00:00:00.000Z",
      "createdAt": "2023-01-01T00:00:00.000Z"
    },
    "accessToken": "jwt_token",
    "expiresIn": "7d"
  }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error message",
  "errors": [
    {
      "field": "email",
      "message": "Please provide a valid email"
    }
  ]
}
```

## Security Features

- **Password Hashing**: Bcrypt with salt rounds of 12
- **JWT Tokens**: Access tokens (7 days) and refresh tokens (30 days)
- **Rate Limiting**: 100 requests per 15 minutes per IP
- **CORS**: Configured for frontend origin
- **Helmet**: Security headers
- **Input Validation**: Express-validator for all inputs
- **Error Handling**: Comprehensive error handling middleware

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | 3000 |
| `NODE_ENV` | Environment | development |
| `MONGODB_URI` | MongoDB connection string | - |
| `JWT_SECRET` | JWT signing secret | - |
| `JWT_EXPIRES_IN` | Access token expiry | 7d |
| `JWT_REFRESH_SECRET` | Refresh token secret | - |
| `JWT_REFRESH_EXPIRES_IN` | Refresh token expiry | 30d |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | - |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret | - |
| `GOOGLE_CALLBACK_URL` | Google OAuth callback URL | - |
| `FRONTEND_URL` | Frontend URL for CORS | http://localhost:3001 |

## Database Schema

### User Model
```javascript
{
  name: String (required),
  email: String (required, unique),
  password: String (hashed),
  googleId: String (unique, sparse),
  avatar: String,
  role: String (enum: ['user', 'admin']),
  isEmailVerified: Boolean,
  lastLogin: Date,
  isActive: Boolean,
  refreshTokens: Array,
  timestamps: true
}
```

## Development

### Running in Development Mode
```bash
npm run dev
```

### Testing Endpoints
Use tools like Postman, Insomnia, or curl to test the API endpoints.

### Database Connection
The app automatically connects to MongoDB on startup. Make sure MongoDB is running.

## Production Deployment

1. Set `NODE_ENV=production`
2. Use strong, unique secrets for JWT
3. Configure proper CORS origins
4. Set up HTTPS
5. Use environment variables for all sensitive data
6. Set up proper logging
7. Configure MongoDB connection pooling

## Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Check if MongoDB is running
   - Verify connection string in config.env

2. **Google OAuth Error**
   - Verify Google OAuth credentials
   - Check callback URL configuration

3. **JWT Token Error**
   - Ensure JWT_SECRET is set
   - Check token expiration

4. **CORS Error**
   - Verify FRONTEND_URL in config.env
   - Check CORS configuration

## License

MIT License 