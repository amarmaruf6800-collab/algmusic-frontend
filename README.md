# 🎵 ALGMUSIC

> Full-stack music discovery and playback web application built with React, Vite, FastAPI, and Python.

ALGMUSIC is a web application focused on music search, exploration, playback, playlists, liked songs, recently played tracks, artist and album discovery, lyrics, and personal library features.

---

## 🌐 Live Demo

**Frontend:**  
https://algmusic.vercel.app

> The application is intended for portfolio and demonstration purposes.

---

## 📸 Preview

![ALGMUSIC Preview](./docs/preview.png)

---

## ✨ Features

### 🔎 Music Search

- Search songs
- Search artists
- Search albums
- Search result tabs and organization
- Search autocomplete / recent search UI

### 🧭 Music Discovery

- Explore music
- Popular music and charts
- Country-based charts
- Curated / external music playlists
- Playlist suggestions
- Related-track / watch-playlist queue

### ▶️ Music Player

- Song playback interface
- Current track information
- Queue management
- Fullscreen / Now Playing view
- Playback state management
- Embedded YouTube playback integration
- Track thumbnails and duration handling

### ❤️ Personal Library

- Liked Songs
- Recently Played
- Personal Playlists
- Add songs to playlists
- Create playlists with names and descriptions
- User-specific library data

### 🎤 Artist & Album Pages

- Artist detail pages
- Album detail pages
- Songs associated with artists and albums

### 🎼 Lyrics

- Song lyrics endpoint
- Lyrics normalization
- Timestamped lyrics parsing where available

### 🔐 Authentication

- User registration
- User login
- JWT authentication
- Authenticated `/me` profile endpoint
- Password hashing
- User-specific playlists, liked songs, and recently played history

### 🌓 UI / UX

- Dark and light themes
- Responsive navigation
- Desktop sidebar
- Mobile navigation
- Toast notifications
- Skeleton loading states
- Modern music-player interface

---

## 🧱 Architecture

```text
┌──────────────────────────────────┐
│       React + Vite Frontend      │
│          Tailwind CSS            │
│                                  │
│ Search • Explore • Player        │
│ Artists • Albums • Library       │
└───────────────┬──────────────────┘
                │
                │ HTTP / REST API
                ▼
┌──────────────────────────────────┐
│       FastAPI + Python Backend   │
│                                  │
│ Authentication • Search          │
│ Songs • Artists • Albums         │
│ Explore • Personal Library       │
└───────────────┬──────────────────┘
                │
       ┌────────┴────────┐
       │                 │
       ▼                 ▼
┌───────────────┐  ┌──────────────────┐
│ SQLAlchemy    │  │    ytmusicapi    │
│ ORM           │  │ Music metadata   │
└───────┬───────┘  └──────────────────┘
        │
        ▼
┌──────────────────────────────┐
│ MySQL-compatible Database    │
└──────────────────────────────┘
```

The backend uses `ytmusicapi` for music discovery and metadata retrieval.

---

## 🛠️ Tech Stack

### Frontend

- React
- Vite
- Tailwind CSS
- Lucide React
- React YouTube

### Backend

- Python
- FastAPI
- Uvicorn
- SQLAlchemy
- PyJWT
- Passlib
- bcrypt
- python-multipart
- ytmusicapi

### Database

- SQLAlchemy ORM
- MySQL-compatible database

### Deployment

- Vercel
- Python / FastAPI backend deployment

---

## 📁 Project Structure

```text
ALGMUSIC
├── frontend/
│   ├── src/
│   │   ├── Components/
│   │   │   ├── Player.jsx
│   │   │   ├── ExploreMusic.jsx
│   │   │   ├── SearchResults.jsx
│   │   │   ├── ArtistPage.jsx
│   │   │   ├── AlbumPage.jsx
│   │   │   ├── LikedSongs.jsx
│   │   │   ├── PlaylistDetail.jsx
│   │   │   └── Library.jsx
│   │   ├── context/
│   │   └── lib/
│   └── vercel.json
│
└── backend/
    ├── routes/
    │   ├── auth.py
    │   ├── search.py
    │   ├── songs.py
    │   ├── artists.py
    │   ├── albums.py
    │   ├── explore.py
    │   └── library.py
    ├── services/
    │   └── ytmusic.py
    ├── models.py
    ├── schemas.py
    ├── database.py
    └── main.py
```

---

## 🔑 API Overview

### Authentication

```text
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/me
```

### Search

```text
GET /api/search?q=<query>
```

### Songs

```text
GET /api/songs/{video_id}
GET /api/songs/{video_id}/lyrics
```

### Explore

```text
GET /api/explore
GET /api/charts/{country}
GET /api/playlists/{playlist_id}
GET /api/playlists/{playlist_id}/suggestions
GET /api/watch-playlist
```

### Library

```text
GET    /api/library/liked
POST   /api/library/liked/toggle
DELETE /api/library/liked/{video_id}

GET  /api/library/recent
POST /api/library/recent

GET  /api/library/playlists
POST /api/library/playlists
POST /api/library/playlists/{playlist_id}/songs
```

---

## 🚀 Run Locally

### Frontend

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Configure the backend API URL in the frontend environment configuration.

### Backend

Create a Python environment and install dependencies:

```bash
pip install -r requirements.txt
```

Run FastAPI with Uvicorn:

```bash
uvicorn main:app --reload
```

---

## 🔐 Environment Variables

### Frontend

```env
VITE_API_URL=https://your-backend-domain.example.com
```

### Backend

```env
DATABASE_URL=mysql+pymysql://user:password@host:3306/database
CORS_ORIGINS=http://localhost:5173
```

Never commit production credentials, database passwords, JWT secrets, or other sensitive values.

---

## 📌 Project Highlights

ALGMUSIC demonstrates practical full-stack development through:

- React + Python full-stack development
- REST API development with FastAPI
- JWT authentication
- Music discovery and metadata integration
- Stateful audio playback UI
- Queue and playback management
- Personal media library
- Playlist management
- Artist and album exploration
- Lyrics integration
- Responsive UI
- Dark / light theme switching
- Database-backed user features

---

## 🎯 User Flow

```text
Search / Explore
       ↓
   Select Song
       ↓
   Music Player
       ↓
   ┌───┴───────────────┐
   ↓                   ↓
Like / Save         Playlist
   ↓                   ↓
Recently Played    Personal Library
```

---

## 👨‍💻 Author

**Amar**

Junior Web Developer | Full-Stack Enthusiast

Information Technology / Web Development
