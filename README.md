# Online Quiz Portal (MERN Stack)

A comprehensive, full-stack Online Quiz Portal built using the MERN (MongoDB, Express.js, React.js, Node.js) stack. This platform provides a seamless and interactive exam environment for users to take quizzes and for administrators to manage exams, questions, and view analytics.

## 🌟 Features

### For Users (Students)
- **Interactive Exam Environment:** A realistic test-taking interface featuring a dynamic timer, question grid navigation, and intuitive marking options (Attempted, Marked for Review, Skipped, Unexplored).
- **Exam Instructions:** Detailed rules and description available before starting any exam.
- **Strict Expiry Checks:** Exams cannot be started or reattempted past their designated expiry date.
- **Live Results:** Instant calculation and display of results upon exam submission.
- **Detailed Review:** Ability to review answers against the correct options post-exam.
- **Reports & Analytics:** Dashboard to view past attempts and scores.

### For Administrators
- **Exam Management:** Create, update, delete, and publish exams with customizable durations, passing marks, and expiry dates.
- **Question Management:** Add multi-choice or single-choice questions, complete with image support and correct answers.
- **Real-Time Updates:** CRUD operations reflect instantly across the portal.
- **Advanced Analytics:** View comprehensive reports of all user attempts, scores, and overall performance.

### Security & Architecture
- **Authentication & Authorization:** Secure JWT-based authentication with separate roles for Users and Admins.
- **Password Hashing:** Passwords securely hashed using bcrypt.
- **State Management:** Efficient global state handling using Redux Toolkit.

## 🛠️ Tech Stack

### Front-End
- **React.js:** Core UI framework.
- **Redux Toolkit:** State management.
- **Ant Design (antd):** UI component library.
- **Vanilla CSS:** Styling.

### Back-End
- **Node.js:** JavaScript runtime.
- **Express.js:** Web framework.
- **Mongoose:** Object Data Modeling (ODM) library.
- **JSON Web Tokens (JWT):** Authentication strategy.

### Database
- **MongoDB:** NoSQL database for storing users, exams, questions, and reports.

## 🚀 Getting Started

Follow these steps to set up the project locally.

### Prerequisites
- Node.js installed on your machine.
- MongoDB instance (local or Atlas URI).

### 1. Clone the repository
```bash
git clone https://github.com/your-username/QuizPortal-master.git
cd QuizPortal-master
```

### 2. Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `backend` directory and add the following variables:
   ```env
   PORT=5000
   MONGO_URL=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   ```
4. Start the backend server:
   ```bash
   npm run dev
   ```

### 3. Frontend Setup
1. Open a new terminal window and navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the React development server:
   ```bash
   npm start
   ```

### 4. Application Access
- The Frontend should now be running at `http://localhost:3000`
- The Backend server will be running at `http://localhost:5000`

## 📸 Screenshots & Usage

- **Registration & Login:** Secure access point for both roles.
- **User Dashboard:** View available exams and your past reports.
- **Test Environment:** Use the grid on the right to navigate. Mark questions for review if you are unsure.
- **Admin Panel:** Navigate to the admin dashboard to build new exams and populate them with questions.

## 🤝 Contributing
Contributions are always welcome! Feel free to open an issue or submit a pull request if you'd like to improve the application.

## 📝 License
This project is licensed under the MIT License.
