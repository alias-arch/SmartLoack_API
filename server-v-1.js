// Import required modules
const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const users = require('./db.json').users;


const app = express();

// Use middleware to handle incoming requests
app.use(bodyParser.urlencoded({extended :false}));
let isLocked = false;

app.use(bodyParser.json());

app.post('/login', (req, res) => {
  const { username, password } = req.body;

  // Check if user exists in the JSON server
  const user = users.find(user => user.username === username);
  if (!user) {
    return res.status(401).json({ error: 'Invalid username' });
  }

  // Check if password is correct
  if (user.password !== password) {
    return res.status(401).json({ error: 'Invalid password' });
  }

  // Generate JWT token
  const token = jwt.sign({ username,  role: user.role,}, 'secret-key');

  // Send token as response
  res.json({ token });
});

function authenticateAndAuthorizeLock(req, res, next) {
  const authorizationHeader = req.headers.authorization;
  if (authorizationHeader) {
    const token = authorizationHeader.split(" ")[1];
    console.log(jwt.verify(token,"secret-key"));
    jwt.verify(token, "secret-key", (err, decoded) => {
      if (err) {
        res.status(401).json({ error: "Invalid token" });
      } else {
        const username = decoded.username;
        const permissions = decoded.permissions; 
        console.log(permissions);
        if (permissions === "Allowed") {
          req.username = username;
          req.permissions = permissions;
          next();
        } else {
          res.status(403).json({ error: "Access forbidden" });
        } 
      }
    });
  } else {
    res.status(401).json({ error: "Authorization header missing" });
  } 
}

function authenticateAndAuthorizeUnlock(req, res, next) {
  const authorizationHeader = req.headers.authorization;
  if (authorizationHeader) {
    const token = authorizationHeader.split(" ")[1];
    jwt.verify(token, "secret-key", (err, decoded) => {
      if (err) {
        res.status(401).json({ error: "Invalid token" });
      } else {
        const username = decoded.username;
        const permissions = decoded.permissions;
        if (permissions === "Allowed") {
          req.username = username;
          req.permissions = permissions;
          next();
        } else {
          res.status(403).json({ error: "Access forbidden" });
        }
      }
    });
  } else {
    res.status(401).json({ error: "Authorization header missing" });
  }
}


// authenticate admin
function authenticateAdmin(req, res, next) {
  const authorizationHeader = req.headers.authorization;
  if (authorizationHeader) {
    const token = authorizationHeader.split(" ")[1];
    jwt.verify(token, "secret-key", (err, decoded) => {
      if (err) {
        res.status(401).json({ error: "Invalid token" });
      } else {
        const username = decoded.username;
        const permissions = decoded.permissions;
        const role = decoded.role;
        if (role === "admin") {
          req.username = username;
          req.permissions = permissions;
          req.role = role;
          next();
        } else {
          res.status(403).json({ error: "Access forbidden" });
        }
      }
    });
  } else {
    res.status(401).json({ error: "Authorization header missing" });
  }
}

// Define endpoint to handle lock requests
app.get('/lock', authenticateAndAuthorizeLock, (req, res) => {
    // Code to lock the door
    isLocked = true;
    res.json({ message: 'Door locked' });
});

// Define endpoint to handle unlock requests
app.get('/unlock', authenticateAndAuthorizeUnlock, (req, res) => {
    // Code to unlock the door
    isLocked = false;
    res.json({ message: 'Door unlocked' });
});

// Define endpoint to handle users data requests
app.get('/users', authenticateAdmin, (req, res) => {
    fetch('http://localhost:5000/users/')
        .then(response => response.json())
        .then(data => {
           res.json(data);})
        .catch( error => {
            console.log('Error fetching data',error);
            return {error:"Error fetching data"};
         })
});
// Define endpoint for admin to update user permissions 
app.put('/update/:id', authenticateAdmin, (req, res) => {
    const userToUpdate = req.body;
    const  id = req.params.id;
    console.log(userToUpdate);
    fetch(`http://localhost:5000/users/${id}`, {
    method: 'PUT',
    headers: {
       'Content-Type': 'application/json'
    },
    body: JSON.stringify(userToUpdate)
    })
     .then(response => response.json())
     .then(updatedUser => {
        res.json(updatedUser);
        console.log(updatedUser); // Process the updated user data here
     })
    .catch(error => {
    console.error('Error updating user:', error);
  });
});

app.post('/add', authenticateAdmin, (req, res) => {
    const user = req.body;
    console.log(user);
    fetch('http://localhost:5000/users', {
    method: 'POST',
    headers: {
       'Content-Type': 'application/json'
    },
    body: JSON.stringify(user)
    })
     .then(response => response.json())
     .then(data => {
        res.json(data);
        console.log(data); // Process the updated user data here
     })
    .catch(error => {
    console.error('Error updating user:', error);
  });

})

app.get('/lockState', (req, res) => {
    res.json({ message: `${isLocked}` });
});




// Start server
app.listen(3000, () => {
  console.log('Server listening on port 3000');
});
