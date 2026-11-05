import { Router } from 'express';
import { body } from 'express-validator';
import { listUsers, getStats, updateRole, deleteUser } from '../controllers/adminController.js';
import { protect, requireRole } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = Router();
router.use(protect, requireRole('admin'));

router.get('/stats', getStats);
router.get('/users', listUsers);
router.patch('/users/:id/role', body('role').isIn(['user', 'admin']).withMessage('Role must be user or admin'), validate, updateRole);
router.delete('/users/:id', deleteUser);

export default router;
