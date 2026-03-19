require('dotenv').config()

const express = require('express');
const cors = require ('cors');
const logRequest = require('./middlewares/Logger.js')
const validateTodo = require('./middlewares/validator.js');
const errorhandler = require('./middlewares/errHandler.js');
const validatePatch = require('./middlewares/validatepatch.js');
const app = express();


app.use(express.json()); // Parse JSON bodies
app.use(cors('corsOptional'));
app.use(logRequest);

let todos = [
  { id: 1, task: 'Learn Node.js', completed: false },
  { id: 2, task: 'Build CRUD API', completed: false },
];

// GET All – Read
app.get('/todos', (req, res) => {
  res.status(200).json(todos); // Send array as JSON
});

app.post('/todos', validateTodo, (req, res, next) => {
try {
    // Validation Check – Task 2
  if (!req.body.task) {
    return res.status(400).json({ error: 'The "task" field is required.' });
  }

  const newTodo = { 
    id: todos.length > 0 ? todos[todos.length - 1].id + 1 : 1, 
    task: req.body.task,
    completed: false // Good practice to default this to false
  };
  
  todos.push(newTodo);
  res.status(201).json(newTodo);
} catch (error) {
  next(error);
}
});

// GET Single Todo – Task 1
app.get('/todos/:id', (req, res, next) => {
try {
  const id = parseInt(req.params.id);
if (isNaN(id)) {
  throw new Error('Invalid ID'); 
}

    const todo = todos.find((t) => t.id === parseInt(req.params.id));
  if (!todo) return res.status(404).json({ message: 'Todo not found' });
  res.status(200).json(todo);
} catch (error) {
  next(error);
}
});



// GET Active – Array Bonus Task
app.get('/todos/active', (req, res) => {
  const activeTodos = todos.filter((t) => !t.completed);
  res.json(activeTodos);
});



// PATCH Update – Partial
app.patch('/todos/:id', validatePatch, (req, res, next) => {
try {
    const todo = todos.find((t) => t.id === parseInt(req.params.id)); // Array.find()
  if (!todo) return res.status(404).json({ message: 'Todo not found' });
  Object.assign(todo, req.body); // Merge: e.g., {completed: true}
  res.status(200).json(todo);
} catch (error) {
  next(error);
}
});

// DELETE Remove
app.delete('/todos/:id', (req, res, next) => {
try {
    const id = parseInt(req.params.id);
  const initialLength = todos.length;
  todos = todos.filter((t) => t.id !== id); // Array.filter() – non-destructive
  if (todos.length === initialLength)
    return res.status(404).json({ error: 'Not found' });
  res.status(204).send(); // Silent success
} catch (error) {
  next(error);
}
});

app.get('/todos/completed', (req, res) => {
  const completed = todos.filter((t) => t.completed);
  res.json(completed); // Custom Read!
});

app.use(errorhandler); 
const PORT = process.env.PORT;

app.listen(PORT, () => {
  console.log(`APP is running on port ${PORT}`)
});
