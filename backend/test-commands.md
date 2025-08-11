# Authentication API Test Commands

## Prerequisites
1. Make sure MongoDB is running locally
2. Start the server: `npm run dev` or `npm start`
3. The server should be running on `http://localhost:3000`

## Test Commands

### 1. User Signup
```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123"
  }'
```

### 2. User Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### 3. Forgot Password
```bash
curl -X POST http://localhost:3000/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com"
  }'
```

### 4. Reset Password (use token from forgot password response)
```bash
curl -X POST http://localhost:3000/api/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{
    "token": "YOUR_RESET_TOKEN_HERE",
    "password": "newpassword123"
  }'
```

### 5. Get Current User (requires access token)
```bash
curl -X GET http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE" \
  -H "Content-Type: application/json"
```

### 6. Refresh Token
```bash
curl -X POST http://localhost:3000/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "YOUR_REFRESH_TOKEN_HERE"
  }'
```

### 7. Logout
```bash
curl -X POST http://localhost:3000/api/auth/logout \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "YOUR_REFRESH_TOKEN_HERE"
  }'
```

### 8. Health Check
```bash
curl -X GET http://localhost:3000/api/health
```

## Testing Flow

1. **Start with Signup** - Create a new user account
2. **Login** - Get access and refresh tokens
3. **Test Protected Route** - Use the access token to call `/me`
4. **Test Forgot Password** - Request password reset
5. **Test Reset Password** - Use the reset token to change password
6. **Test Refresh Token** - Get new access token using refresh token
7. **Test Logout** - Clear tokens and logout

## Expected Responses

### Successful Signup/Login
```json
{
  "success": true,
  "message": "Authentication successful",
  "data": {
    "user": {
      "id": "user_id",
      "name": "Test User",
      "email": "test@example.com",
      "avatar": "",
      "role": "user",
      "isEmailVerified": false,
      "lastLogin": "2024-01-01T00:00:00.000Z",
      "createdAt": "2024-01-01T00:00:00.000Z"
    },
    "accessToken": "jwt_token_here",
    "expiresIn": "15m"
  }
}
```

### Validation Error
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "type": "field",
      "value": "",
      "msg": "Name must be between 2 and 50 characters",
      "path": "name",
      "location": "body"
    }
  ]
}
```

## Troubleshooting

- **MongoDB Connection Error**: Make sure MongoDB is running on `localhost:27017`
- **Port Already in Use**: Change the PORT in `config.env` or kill the process using port 3000
- **JWT Errors**: Check that `JWT_SECRET` and `JWT_REFRESH_SECRET` are set in `config.env`
- **Validation Errors**: Check the request body format and required fields
