# 🔄 Dynamic Admin Data Setup

## 🎯 **How to Get Real Data in Admin Panel**

The admin panel can show **real data from the backend** when MongoDB is running, or **mock data** when it's not.

### **🚀 Option 1: Real Backend Data (Recommended)**

#### **Step 1: Start MongoDB**
```bash
mongod
```

#### **Step 2: Add Sample Data**
```bash
cd backend
node add-sample-data.js
```

#### **Step 3: Start Backend**
```bash
cd backend
npm start
```

#### **Step 4: Start Frontend**
```bash
cd frontend
npm run dev
```

#### **Step 5: Login as Admin**
- **URL**: `http://localhost:5173/login`
- **Email**: `admin@globe.com`
- **Password**: `admin123456`

### **🎯 Option 2: Mock Data (No Backend Required)**

#### **Step 1: Start Frontend Only**
```bash
cd frontend
npm run dev
```

#### **Step 2: Login as Admin**
- **URL**: `http://localhost:5173/login`
- **Email**: `admin@globe.com`
- **Password**: `admin123456`

## ✅ **What You'll See**

### **With Real Backend Data:**
- **Users**: Real users from database
- **Trips**: Real trips created by users
- **Destinations**: Real cities from database
- **Analytics**: Real statistics from database

### **With Mock Data:**
- **Users**: 3 test users (John, Jane, Mike)
- **Trips**: 3 sample trips (Paris, Tokyo, Barcelona)
- **Destinations**: 5 popular cities
- **Analytics**: Realistic statistics

## 🔧 **How It Works**

### **Data Fetching Flow:**
1. **Admin panel loads**
2. **Tries to fetch data from backend APIs**
3. **If successful**: Shows real data
4. **If failed**: Shows mock data as fallback

### **Backend APIs Used:**
- `GET /admin/users` - User management
- `GET /admin/trips` - Trip management
- `GET /admin/destinations` - Destination library
- `GET /admin/analytics/*` - Statistics

### **Frontend Fallback:**
- **No backend required** for testing
- **Mock data** ensures admin panel always works
- **Seamless experience** regardless of backend status

## 📊 **Sample Data Created**

### **Users:**
- **Admin**: `admin@globe.com` / `admin123456`
- **John**: `john@example.com` / `password123`
- **Jane**: `jane@example.com` / `password123`
- **Mike**: `mike@example.com` / `password123`

### **Cities:**
- Paris, Tokyo, New York, Barcelona, Bangkok

### **Trips:**
- Paris Adventure, Tokyo Exploration, Barcelona Beach Trip

## 🎉 **Result**

The admin panel will show **dynamic data** from the backend when available, or **mock data** when the backend is not running. This ensures the admin panel is always functional for testing and development!
