# ReadMyReads

**ReadMyReads** is your personal reading hub — a place to track, review, and share the books you love.

Create your own digital bookshelf, log your reading journey, and highlight favorite phrases.

## Tech Stack

- Frontend: React, Tailwind CSS, Material UI
- Backend: Spring Boot (Java 17), JPA, PostgreSQL
- Auth: Google OAuth
- Deployment: Vercel (frontend), Railway (backend)

## Getting Started

git clone this project

### Frontend

move to frontend, install npm.

```bash
cd frontend
npm install
```

add env file.

- .env  
   Set the following environment variable:
  REACT_APP_API_URL=http://localhost:8080/api/

### Backend

move to backend.

```bash
cd backend
```

add these files.

- .env
  Configure by referencing application.properties.

- .vscode
  in .vscode, add two files
- launch.json

```json
{
  "configurations": [
    {
      "type": "java",
      "name": "Spring Boot-RrdsApplication<RRDS>",
      "request": "launch",
      "cwd": "${workspaceFolder}",
      "mainClass": "com.rmr.backend.RrdsApplication",
      "projectName": "RRDS", //optional
      "args": "",
      "envFile": "${workspaceFolder}/backend/.env" // This file should be gitignore)
    }
  ]
}
```

- settings.json

```json
{
  "java.configuration.runtimes": [
    {
      "name": "JavaSE-17",
      "path": "/path/to/your/java17", // This path may depending on your OS and installation
      "default": true
    }
  ]
}
```
