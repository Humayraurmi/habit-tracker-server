Habit Tracker API Server (Backend)
This repository hosts the RESTful API server and core database logic for the Habit Tracker platform. It is built using the MERN stack (Node.js/Express.js) and interacts with MongoDB Atlas to manage all application data.

✨ Core Objectives
Provide RESTful API: Offer all necessary data handling routes (CRUD operations) for the client application.

Database Interaction: Manage user, habit, testimonial, and auxiliary data through MongoDB Atlas.

Security: Ensure sensitive data (like database credentials) is protected using environment variables (.env).

💻 Tech Stack
Component,Technology,Role
Runtime,Node.js,Server-side JavaScript execution environment.
Framework,Express.js,"Fast, unopinionated web framework for API routes."
Database,MongoDB Atlas,Cloud-hosted NoSQL database for flexible data storage.
Drivers,mongodb,Official MongoDB driver for communication.
Middleware,"cors, dotenv",Handles Cross-Origin Resource Sharing and loads environment variables.

etup and Installation
Follow these steps to get the server running locally:

1. Clone the Repository
   git clone <YOUR_SERVER_REPO_URL_HERE>
cd habit-tracker-server

2. Install Dependencies
Install all required packages listed in package.json:
npm install

3. Environment Variables (.env) Setup
Create a file named .env in the root directory of the project and define your configuration variables. (The connection string uses these variables.)
PORT=5000
DB_USER=<Your_MongoDB_Atlas_Username>
DB_PASS=<Your_MongoDB_Atlas_Password>
# If implementing JWT for secured routes
JWT_SECRET=<A_Very_Strong_Secret_Key>

4. Run the Server
Start the server using the development script:
npm run dev
# The server will start on http://localhost:5000 (or the defined PORT)

User and Supporting Data Endpoints
Method,Endpoint,Collection,Description
POST,/users,users,Registers a new user; prevents duplicate inserts based on email.
GET/POST,/benefits,benefits,Manages data for the benefits section.
GET/POST,/how-it-works,steps,Manages data for the how-it-works section.
GET/POST,/testimonials,testimonials,Manages user testimonials.

🔗 Related Links
Live API Deployment: https://habit-tracker-server-seven.vercel.app/
Client Repository (Frontend): https://github.com/Humayraurmi/habit-tracker-client
