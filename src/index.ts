import { NextFunction, Request, Response } from "express";
import cors from "cors";
import ProjectsController from "./controllers/projects-controller";

// Express server boilerplate
const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(cors())
app.use(express.urlencoded({ extended: true }));

// Controllers
app.use("/projects", ProjectsController);

// Routes
app.get('/', (req: Request, res: Response) => {
  res.send('Hello World!');
});

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// Start server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
}); 