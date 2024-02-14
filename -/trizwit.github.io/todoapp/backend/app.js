// app.js

const express = require('express');
const bodyParser = require('body-parser');
const { Sequelize, DataTypes } = require('sequelize');

const app = express();
const port = 3000;

app.use(bodyParser.json());

// Replace 'your_database_name', 'your_username', and 'your_password' with your PostgreSQL database credentials
const sequelize = new Sequelize('zaxqkdld', 'zaxqkdld', '7uw5QdHx_6s-Cjt-Gb5Ag-4idR5_Aq4g', {
    host: 'trumpet.db.elephantsql.com',
    dialect: 'postgres',
    port: 5432, // PostgreSQL default port
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

// Get all todos based on user and type (myday, important, flagged)
app.get('/todos/:userId/:type', async (req, res) => {
    const { userId, type } = req.params;
  
    try {
      const user = await User.findByPk(userId, {
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
  app.post('/todos/:userId', async (req, res) => {
    const { userId } = req.params;
  
    try {
      const user = await User.findByPk(userId);
  
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
  app.delete('/todos/:userId/:id', async (req, res) => {
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
  app.put('/todos/:userId/:id/toggle', async (req, res) => {
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
  