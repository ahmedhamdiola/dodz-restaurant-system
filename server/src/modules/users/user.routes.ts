import { Router } from 'express';
import { UserController } from './user.controller.js';
import { requireAuth, requireRole } from '../auth/auth.middleware.js';

const router = Router();
const controller = UserController();

router.get('/', requireAuth, requireRole('admin'), controller.getUsers); // get all users with pagination {admin}
router.get('/email/:email', requireAuth, requireRole('admin'), controller.getUserByEmail); // get user by email {admin}
router.get('/:id', requireAuth, controller.getUserByID); // get user by id {auth: self or admin}

router.post('/', requireAuth, requireRole('admin'), controller.createUser); // create user {admin}

router.put('/:id', requireAuth, controller.updateUser); // edit user {auth: self or admin}

router.delete('/:id', requireAuth, requireRole('admin'), controller.deleteUser); // delete user {admin}

export default router;