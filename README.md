# EdTech Interactive Learning & Assessment Portal (MongoDB Connected)

This application has been updated with a full **Node.js + Express + Mongoose** backend that connects directly to **MongoDB** to persist user registration, course assignments, quiz attempts, and code submissions.

---

## 🍃 MongoDB Features Added

1. **User Registration & Persistence**:
   - New student registrations are stored directly in MongoDB in the `users` collection.
   - Includes unique username validation, password checking, role assignment, and timestamping.
2. **Student & Admin Authentication**:
   - Students authenticate against the MongoDB database.
   - Admin demo credentials (`admin` / `admin123`) allow assigning courses and reviewing progress.
3. **Course Assignment & Quiz Tracking**:
   - Assigned courses, completed lessons, and quiz scores are synced to MongoDB.
4. **Code Submissions**:
   - Student code submissions, AI-pattern heuristics, and plagiarism similarity scores are stored in MongoDB in the `submissions` collection.

---

## 🚀 How to Run

### Method 1: Double-click
Double-click **`start.bat`** in this folder.

### Method 2: Command Line
```powershell
cd server
npm start
```

Then open your browser at:
**[http://localhost:5000](http://localhost:5000)**

---

## ⚙️ MongoDB Configuration

Configuration is located in [`server/.env`](server/.env):

### Local MongoDB (Default)
```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/edtech_portal
```

### MongoDB Atlas (Cloud)
To connect to MongoDB Atlas cloud instead of a local database:
1. Open [`server/.env`](server/.env).
2. Set your Atlas connection string:
   ```env
   MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/edtech_portal?retryWrites=true&w=majority
   ```
3. Restart the server.
