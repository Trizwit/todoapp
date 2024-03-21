// app.js

require('dotenv').config();

const express = require('express');
const { json } = require('body-parser');
const { Sequelize, DataTypes } = require('sequelize');
// const { auth } = require('express-openid-connect');
// const { requiresAuth } = require('express-openid-connect');

// const config = {
//   authRequired: false,
//   auth0Logout: true,
//   secret: process.env.SESSION_SECRET,
//   baseURL: process.env.BASE_URL || 'http://localhost:8000/login',
//   clientID: process.env.CLIENT_ID,
//   issuerBaseURL: process.env.ISSUER_BASE_URL
// };

// using Auth0 api authorization 
const jwt = require("express-jwt");
const jwksRsa = require("jwks-rsa");

// Define middleware that validates incoming bearer tokens
// using JWKS from YOUR_DOMAIN
const jwtCheck = jwt.expressjwt({
  secret: jwksRsa.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: process.env.AUTH0_JWKS_URI
  }),
  audience: process.env.AUTH0_AUDIENCE,
  issuer: process.env.AUTH0_ISSUER,
  algorithms: ["RS256"]
});


// Create an Express application
const app = express();
const port = 3000;


app.use(json());


// auth router attaches /login, /logout, and /callback routes to the baseURL
// app.use(auth(config));


// Replace 'your_database_name', 'your_username', and 'your_password' with your PostgreSQL database credentials
const sequelize = new Sequelize({
  database: process.env.DB_NAME,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  dialect: process.env.DB_DIALECT,
  
});

// Define the Todo model
const Todo = sequelize.define('Todo', {
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
  },
  type: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isIn: [['myday', 'important', 'flagged']],
    },
  },
  status: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isIn: [['complete', 'pending', 'in-progress', 'canceled']],
    },
  },
});

// Define the User model
const User = sequelize.define('User', {
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true, // Ensure usernames are unique
    },
  });
  
  // Define the association between User and Todo
  User.hasMany(Todo);
  Todo.belongsTo(User);
  
  // Sync the models with the database
  sequelize.sync()
    .then(() => {
      console.log('Database and tables synced');
    })
    .catch((error) => {
      console.error('Error syncing database:', error);
    });



// Routes

app.get('/', jwtCheck, (req, res) => {
  if (!req.user) {
    return res.status(401).send('User not authenticated');
  }
  else {
    res.send('auth0 api authorization');
  }
});



// create a route adduser to add user to the database if not already present
app.post('/adduser/:email', async (req, res) => {
  const { email } = req.params;

  try {
    const [user, created] = await User.findOrCreate({
      where: { username: email },
    });

    res.send({
      name: email,
      userId: user.id,
      created
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});



// Get all todos based on user email (stored in username column) and type (myday, important, flagged)
app.get('/fetchtodos/:username/:type', async (req, res) => {
  const { username, type } = req.params;

  try {
    const user = await User.findOne({
      where: { username },
      include: [{
        model: Todo,
        where: { type },
      }],
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user.Todos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});



  // Add a new todo for a specific user
  app.post('/addtodos/:username', async (req, res) => {
    const { username } = req.params;

    try {
      const user = await User.findOne({ where: { username } });

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      const { title, description, type, status } = req.body;
      const todo = await Todo.create({ title, description, type, status });
      await user.addTodo(todo);

      res.json(todo);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
















  // Delete a todo by ID for a specific user
  app.delete('/todos/:userId/:id', jwtCheck, async (req, res) => {
    const { userId, id } = req.params;

    try {
      const user = await User.findByPk(userId);

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      const todo = await Todo.findByPk(id);

      if (!todo) {
        return res.status(404).json({ error: 'Task not found' });
      }

      await todo.destroy();
      res.json({ message: 'Task deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Toggle the status of a todo between 'complete' and 'pending' by ID for a specific user
  app.put('/todos/:userId/:id/toggle', jwtCheck, async (req, res) => {
    const { userId, id } = req.params;

    try {
      const user = await User.findByPk(userId);

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      const todo = await Todo.findByPk(id);

      if (!todo) {
        return res.status(404).json({ error: 'Task not found' });
      }

      // Toggle the status between 'complete' and 'pending'
      todo.status = todo.status === 'complete' ? 'pending' : 'complete';
      await todo.save();

      res.json({ message: 'Task status toggled successfully' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Start the server
  app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
  });
