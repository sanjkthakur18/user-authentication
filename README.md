Backend Application for User Authentication

This is a Node.js backend application for user authentication using Express, MongoDB, and JWT.

Table of Contents
-----------------------------
1. Overview
2. Features
3. Requirements
4. Installation
5. Usage
6. Endpoints
----------------------------------------------------

-----------
1. Overview
-----------
This backend application provides APIs for user authentication, including registration, login, logout, updating user information, resetting passwords, and more. It utilizes MongoDB for data storage, Express for API routing, JWT for authentication, and bcrypt for password hashing.
----------------------------------------------------

-----------
2. Features
-----------
1. User registration with validation
2. User login with JWT authentication
3. Token-based logout
4. Updating user information
5. Getting single user details
6. Getting all users
7. Deleting a user
8. Updating user password
9. Generating and sending reset password tokens via email
10. Resetting user password
---------------------------------------------------------------

---------------
3. Requirements
---------------
Before running the application, ensure you have the following installed:

Node.js
MongoDB
Nodemailer (for sending emails)
---------------------------------

---------------
4. Installation
---------------
1. Install dependencies:
cd backend-app
npm install

2. Set up environment variables:

Create a .env file in the root directory
Add the following variables:

PORT=3000
JWT_SECRET=your_jwt_secret
MAIL_ID=your_email
MAIL_PASSWORD=your_email_password
-----------------------------------------------------------------------------------

--------
5. Usage
--------
To start the server, run:

npm start

The server will run on http://localhost:3000 by default. You can modify the port in the .env file.

Endpoints
The following endpoints are available:

1. POST /api/auth/register-user: Register a new user
2. POST /api/auth/login-user: Login a user
3. GET /api/auth/logout-user: Logout the logged-in user
4. PUT /api/auth/:id/update-user: Update user details
5. GET /api/auth/:id/single-user: Get details of a single user
6. GET /api/auth/all-users: Get details of all users
7. DELETE /api/auth/:id/delete-user: Delete a user
8. PUT /api/auth/update-password: Update user password
9. POST /api/auth/forgot-password-token: Request a password reset token via email
10. PUT /api/auth/reset-password/:token: Reset user password using the token
---------------------------------------------------------------------------------------------------------------------------