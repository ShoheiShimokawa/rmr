# ReadMyReads

**ReadMyReads** is your personal reading hub — a place to track, review, and share the books you love.

Create your own digital bookshelf, log your reading journey, and highlight favorite phrases.

## Tech Stack

- Frontend: React, Tailwind CSS, Material UI
- Backend: Spring Boot (Java 17), JPA, PostgreSQL
- Auth: Google OAuth
- Deployment: Vercel (frontend), Railway (backend)

## Getting Started

1. Git clone this project.

## Frontend

add these files.

- node_modules
- .env  
   Set the following environment variable:
  REACT_APP_API_URL=http://localhost:8080/api/

## Backend

add these files
.vscode

- launch.json

````json
  {
  "configurations": [
  {
  "type": "java",
  "name": "Spring Boot-RrdsApplication<RRDS>",
  "request": "launch",
  "cwd": "${workspaceFolder}",
  "mainClass": "com.rmr.backend.RrdsApplication",
  "projectName": "RRDS",　//optional
  "args": "",
  "envFile": "${workspaceFolder}/backend/.env" // This file should be excluded from version control (.gitignore)
  }
  ]
  }
- settings.json

```json
  {
  "java.configuration.runtimes": [
  {
  "name": "JavaSE-17",
  "path": "/path/to/your/java17",　 // ← This path may vary depending on your OS and installation
  "default": true
  }
  ]
  }
  .env
````
