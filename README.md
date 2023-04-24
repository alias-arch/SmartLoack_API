# Smart-Lock-Api
This is a Node.js REST API built with Express and JWT authentication 
that implements the backend for a mobile application that controls the locking
and unlocking of an electric lock and manages authentication.

Features

    -Register and authenticate users with JSON Web Tokens (JWT)
    -Lock and unlock the electric lock with secure API endpoints
    -add and update users informations.
    
Requirements

    -Node.js v12 or higher
    -json server
    
Endpoints

The API exposes the following endpoints:

    -POST /login - Authenticate a user and return a JWT token
    -GET /lock - Lock the electric lock
    -GET /unlock - Unlock the electric lock
    -GET /users - Get the users informations stored in the json server (only users with admin role can access this endpoint)
    -PUT /update/:id - update user information based on his ID
    -POST /add  - add user to our json server
    -GET /lockState - get information about the state of our electric lock
