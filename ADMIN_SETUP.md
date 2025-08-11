# 👑 Admin Setup Guide

## 🚀 Quick Setup

### 1. Start MongoDB
```bash
mongod
```

### 2. Create Admin User
```bash
cd backend
node create-admin.js
```

### 3. Start Backend
```bash
cd backend
npm start
```

### 4. Start Frontend
```bash
cd frontend
npm run dev
```

### 5. Login as Admin
- **URL**: `http://localhost:5173/login`
- **Email**: `admin@globe.com`
- **Password**: `admin123456`

## ✅ Admin Features

- **Dashboard Overview**: KPI cards and statistics
- **User Management**: View and manage all users
- **Trip Management**: Monitor and manage trips
- **Content Moderation**: Handle reported content
- **Destination Library**: Manage cities and activities
- **Analytics**: View detailed statistics
- **System Settings**: Configure app settings

## 🔧 Troubleshooting

### If you get 401 errors:
1. Make sure MongoDB is running
2. Run `node create-admin.js` to create admin user
3. Restart the backend server

### If backend won't start:
1. Check if port 3000 is available
2. Make sure MongoDB is running
3. Check console for error messages
