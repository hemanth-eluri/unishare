# UniShare Project Report

## Overview
UniShare is a full-stack web application designed for a university resource sharing platform. It allows users to browse, search, upload, and rate academic resources (like notes, videos, and PDFs). The application supports authentication, distinguishing between standard users and administrators, with admins having special privileges such as managing subjects, viewing reports, and verifying resources.

## Technology Stack
The project utilizes a modern Javascript/Typescript stack:
*   **Frontend**: React 19, React Router DOM 7, Tailwind CSS 4, Framer Motion (for animations), Lucide React (for icons), built using Vite.
*   **Backend**: Node.js with Express.js.
*   **Database**: MongoDB (using Mongoose as ODM) with fallback in-memory data structures for rapid prototyping and local execution without a DB.
*   **Authentication**: Custom email/password based auth, utilizing `bcryptjs` for password hashing.
*   **File Uploads**: `multer` is used to handle local file uploads on the server.
*   **Language**: TypeScript is used extensively across both the frontend and backend architectures.

## Architecture
The application follows a standard Single Page Application (SPA) architecture combined with a REST API backend. During local development, the backend Express server acts as the primary entry point, spinning up Vite in middleware mode to serve the React application and provide hot-module reloading. In production, Vite builds a static bundle that the Express server statically serves alongside the API routes.

## File & Directory Roles

### Root Level Files
*   **`package.json` & `package-lock.json`**: Manage the project's frontend and backend dependencies, scripts (e.g., `dev` to run the TSX server, `build` for Vite), and basic metadata.
*   **`server.ts`**: The core backend entry point. It sets up the Express server, connects to MongoDB (or utilizes fallback arrays if no `MONGODB_URI` is provided), defines Mongoose schemas (Resource, User, Video, Vote, etc.), configures static file serving for uploads, and defines all REST API endpoints (`/api/resources`, `/api/login`, `/api/upload-resource`, etc.).
*   **`vite.config.ts`**: Configuration for Vite, the frontend build tool and dev server. Includes plugins like `@vitejs/plugin-react` and Tailwind setup.
*   **`tsconfig.json`**: TypeScript compiler configuration, defining paths, module resolution, and strict typing rules.
*   **`index.html`**: The main HTML file served to the client, acting as the mount point for the React application (`<div id="root"></div>`).
*   **`.env` & `.env.example`**: Store environment variables (e.g., `MONGODB_URI`, `GEMINI_API_KEY`).
*   **`README.md`**: Provides instructions for setting up and running the application locally.

### Key Directories
*   **`src/`**: Contains all the frontend React source code.
*   **`dist/`**: The auto-generated directory containing the optimized static production build output created by Vite (when running `npm run build`).
*   **`node_modules/`**: Contains the installed NPM dependencies.
*   **`public/`**: Stores static public assets like the favicon or raw images.
*   **`uploads/`**: The target directory where `multer` saves user-uploaded documents locally.

### Frontend (`src/` Directory)
*   **`main.tsx`**: The main frontend entry point. Uses `ReactDOM.createRoot` to render the `<App />` application into the DOM index.html.
*   **`App.tsx`**: The core component acting as the React Router setup. It maps URL paths (like `/`, `/login`, `/browse`) to their respective page components. Also wraps the app in context providers (like `AuthProvider`).
*   **`index.css`**: The main stylesheet, typically used for global CSS resets or pulling in Tailwind directives.

#### `src/pages/`
Contains the top-level view components mapping to specific application routes.
*   **`Home.tsx`**: The landing or root page of the application, often featuring a hero section or summary.
*   **`Browse.tsx`**: A primary page for viewing and filtering all available resources and videos.
*   **`Upload.tsx`**: A form-based page allowing logged-in users to submit new documents to the platform.
*   **`ResourceDetail.tsx`**: A dynamic page displaying details about a specific resource item, handling view tracking and ratings.
*   **`Search.tsx`**: Provides search functionality across titles and subjects.
*   **`Login.tsx` & `Register.tsx`**: Handles user authentication, allowing users to log in or create new accounts.
*   **`Reports.tsx`**: An admin-only dashboard page for reviewing user-reported content.
*   **`AdminSubjects.tsx`**: An admin page allowing management (creation/deletion) of course subjects.
*   **`NotFound.tsx`**: A 404 error page displayed when a user navigates to an undefined route.

#### `src/components/`
Contains reusable UI elements.
*   **`Layout.tsx`**: The main structural shell of the app (e.g., Header, Navigation Bar, Footer) that wraps page content. 

#### `src/context/`
*   **`AuthContext.tsx`**: A React Context provider responsible for maintaining the global authentication state of the user (e.g., `user` object representing the logged-in session, and login/logout functions).

#### `src/config/`
*   Houses frontend configuration settings, potentially setting up Axios instances or defining backend API base URLs.

## Summary
The UniShare project provides a comprehensive foundation for learning and sharing. Its hybrid architecture with fallback states makes it very resilient for local development and easily extensible for future cloud deployment.
