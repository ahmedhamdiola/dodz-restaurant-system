import { Router } from 'express';
import { UserController } from './user.controller.js';

const router = Router();
const controller = UserController();

router.get('/', controller.getUsers); // get all users with pagination {admin}
router.get('/email/:email', controller.getUserByEmail); // get user by email {admin}
router.get('/:id', controller.getUserByID); // get user by id {all}

router.post('/', controller.createUser); // create user {all}
router.put('/:id', controller.updateUser); // edit user {all} (own profile) / {admin}
router.delete('/:id', controller.deleteUser); // delete user {admin}

export default router;