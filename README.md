🎬 FilmFlick
FilmFlick is a full-stack movie discovery and review platform. Users can explore movies, write reviews, follow friends, and maintain their personal movie journal — all in one place.

🛠️ Tech Stack
**Frontend**:  
- React.js  
- Redux Toolkit  
- Axios  
- Tailwind CSS  

**Backend**:  
- Node.js  
- Express.js  
- MySQL  
- JWT for authentication  
- dotenv for environment configuration  
- cookie-parser & CORS  

🚀 Features
- 🔐 User authentication (signup, login, logout)
- 🎥 Browse and search movies (powered by TMDB API)
- 📝 Write and edit reviews
- ⭐ Rate movies and track favourites
- 👤 Follow/unfollow users
- 📔 Personal movie journal
- 🔍 Hybrid search (search movies and users together)
- 🌙 Dark mode and responsive design

## 📁 Project Structure
```plaintext
FilmFlick/
│
├── client/ # React frontend
├── server/ # Node/Express backend
│ ├── routes/ # Route handlers (movies, user, review, etc.)
│ ├── controllers/ # Controller logic
│ ├── middleware/ # Auth, error handling, etc.
│ ├── database/ # DB connection
│ ├── models/ # MySQL queries / abstractions
│ └── app.js # Main entry point
├── .env
└── README.md
---

🖼️ Screenshots
### 🔹 Home Page - Following Activity section
![Home Page](./client/src/screenshots/following-activity.png)

### 🔹 Home Page - Reccomendation section
![Home Page](./client/src/screenshots/recommended.png)

### 🔹 User Profile
![Profile Page](./client/src/screenshots/profile.png)

### 🔹 Review Page
![Review](./client/src/screenshots/review.png)

### 🔹 Journal Page
![Journal](./client/src/screenshots/journal.png)

### 🔹 Movie Detials Page
![Movie-details](./client/src/screenshots/movie-details.png)

### 🔹 Review Form Page
![Review Form](./client/src/screenshots/review-form.png)

### 🔹 Search Page
![Search](./client/src/screenshots/search.png)

🙋‍♂️ Author
Shashank Bharadwaj
LinkedIn • GitHub
