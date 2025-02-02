
import { Request, Response, Router } from 'express';
import { projectDB } from "../db/projects-db";

const db = new projectDB();

const router = Router()

router.get('/', async (req: Request, res: Response) => {
  const projects = await db.getAll()
  res.send(projects)
})

router.post('/', async (req: Request, res: Response) => {
    const project = req.body
    const newProject = await db.create(project)
    res.send(newProject)
})

router.delete('/:projectId', async (req: Request, res: Response) => {
    const projectId = req.params.projectId
    const deletedProject = await db.delete(projectId)
    res.send(deletedProject)
})

export default router;