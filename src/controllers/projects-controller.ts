import { Request, Response, Router } from 'express';
import { projectDB } from "../db/projects-db";

const db = new projectDB();
const router = Router();

// Cache configuration
const CACHE_DURATION = 60 * 60 * 1000; // 60 minutes in milliseconds

// Cache storage
let projectsCache: {
  data: any;
  lastModified: number;
  expiresAt: number;
} | null = null;

const isCacheValid = () => {
  return projectsCache && Date.now() < projectsCache.expiresAt;
};

router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    // Return cached data if valid
    if (isCacheValid()) {
      res.send(projectsCache!.data);
      return;
    }

    const projects = await db.getAll();
    
    // Update cache with new data
    projectsCache = {
      data: projects,
      lastModified: Date.now(),
      expiresAt: Date.now() + CACHE_DURATION
    };
    
    res.send(projects);
  } catch (error) {
    projectsCache = null; // Invalidate cache on error
    res.status(500).send({ error: 'Failed to fetch projects' });
  }
});

router.post('/', async (req: Request, res: Response): Promise<void> => {
    try {
        const project = req.body;
        const newProject = await db.create(project);
        projectsCache = null; // Invalidate cache
        res.send(newProject);
    } catch (error) {
        res.status(500).send({ error: 'Failed to create project' });
    }
});

router.delete('/:projectId', async (req: Request, res: Response): Promise<void> => {
    try {
        const projectId = req.params.projectId;
        const deletedProject = await db.delete(projectId);
        projectsCache = null; // Invalidate cache
        res.send(deletedProject);
    } catch (error) {
        res.status(500).send({ error: 'Failed to delete project' });
    }
});

export default router;
