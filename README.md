# DRAG.ai – AI-Powered Content Generator Platform

Create. Generate. Innovate.


  An AI-powered content generation platform that simplifies digital content creation through intelligent UGC video generation and automated presentation generation.


---

## About the Project

**DRAG.ai** is an AI-powered content generation platform designed to make digital content creation faster, easier, and more accessible.

The platform combines Artificial Intelligence with modern web technologies to provide two major content generation capabilities:

- **AI UGC Video Generation:** Generate realistic user-generated-content-style promotional videos using product information, AI avatars, and voice selection.
- **AI Presentation Generation:** Create structured PowerPoint presentations based on user-provided topics and source materials.

DRAG.ai aims to simplify content creation by reducing manual effort and providing an integrated platform for generating marketing videos and professional presentations.

## Key Features

### 1. AI-Powered UGC Video Generation
- Generate promotional video content using product details.
- Select AI avatars and voices.
- Generate AI-powered scripts for marketing content.
- Create realistic UGC-style videos using AI video generation services.
- Preview and download generated videos.

### 2. AI Presentation Generation
- Generate presentations using AI.
- Provide a topic and presentation requirements.
- Upload supported source documents for content-based generation.
- Generate structured presentation slides.
- Preview and download generated presentations.

### 3. User Authentication
- User registration and login.
- Secure password handling.
- Authentication using JWT.
- Protected application routes.

### 4. User Dashboard
- Centralized project management.
- Access video and presentation generation modules.
- View and manage generated content.

## Technology Stack

| Category | Technologies |
|---|---|
| Frontend | React.js, Vite |
| Styling | Tailwind CSS |
| Routing | React Router |
| Animations | Framer Motion |
| HTTP Requests | Axios |
| Backend | Node.js, Express.js |
| Database | MongoDB, Mongoose |
| Authentication | JWT, bcrypt |
| AI Script Generation | Google Gemini API |
| AI Video Generation | HeyGen API |
| API Integration | REST APIs |
| Version Control | Git, GitHub |

## System Architecture

```text
                 DRAG.ai
                    |
          +---------+---------+
          |                   |
       Frontend             Backend
      React + Vite        Node + Express
          |                   |
          |              +----+----+
          |              |         |
          |          Authentication |
          |              |         |
          |          API Services  |
          |              |         |
          |       +------+------+
          |       |             |
          |   Gemini API    HeyGen API
          |       |             |
          |   AI Scripts    AI Videos
          |                     |
          |              Presentation
          |                Generation
          |                     |
          +---------------------+
                    |
                 Database
                  MongoDB
```

## Application Workflow

### UGC Video Generation

1. User enters product and brand information.
2. User selects an AI avatar and voice.
3. Backend processes the generation request.
4. AI services generate the required content.
5. Generated video is made available for preview and download.

### PPT Generation

1. User enters a presentation topic and requirements.
2. User can provide supported source materials.
3. Backend processes the request.
4. AI services assist with content generation.
5. Presentation slides are generated.
6. User can preview and download the presentation.

## Project Structure

```text
UGC-Ad-Platform/
│
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── utils/
│   ├── uploads/
│   └── server.js
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   ├── services/
│   │   └── assets/
│   └── package.json
│
├── README.md
└── .gitignore
```

*The structure above represents the main application organization. Refer to the actual project files for the complete structure.*

## Installation and Setup

### Prerequisites

- Node.js and npm
- MongoDB / MongoDB Atlas
- Git
- Required AI API credentials

### 1. Clone the Repository

```bash
git clone https://github.com/dhanyata2009-sudo/DRAG-AI-Platform.git
```

### 2. Navigate to the Project

```bash
cd DRAG-AI-Platform
```

### 3. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file inside the backend directory and configure the required environment variables.

Example:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
GEMINI_API_KEY=your_gemini_api_key
HEYGEN_API_KEY=your_heygen_api_key
```

Add any other environment variables required by your implementation.

Start the backend:

```bash
npm run dev
```

### 4. Frontend Setup

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

Open the local URL displayed by Vite in your browser.

**Note:** The exact scripts and environment variable names should match the project's actual configuration. Some external AI features require valid API credentials.

## Security

- Password hashing for secure authentication.
- JWT-based authentication.
- Protected backend routes.
- Environment variables for API credentials.
- Sensitive configuration files excluded from version control.

## Project Objectives

- Simplify AI-powered digital content creation.
- Automate UGC-style promotional video generation.
- Reduce the manual effort involved in presentation creation.
- Integrate multiple AI services into a single platform.
- Provide an accessible and user-friendly content generation experience.

## Future Scope

- Additional AI video generation models.
- More avatar and voice options.
- Advanced presentation templates.
- Multilingual content generation.
- Enhanced content editing capabilities.
- Improved project management and collaboration.

## Contributors

Developed as a collaborative Diploma Computer Engineering project.

## Project Information

**Project Name:** DRAG.ai – AI-Powered Content Generator Platform

**Project Type:** Full-Stack Web Application

**Domain:** Artificial Intelligence and Web Development

**Purpose:** AI-powered marketing video and presentation generation.

---

<p align="center">
  <strong>DRAG.ai – Transforming Ideas into Digital Content with AI.</strong>
</p>