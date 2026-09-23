import { Router } from 'express';
import { ContactController } from './contact.controller.js';
import { requireAuth, requireRole } from '../auth/auth.middleware.js';

const router = Router();
const controller = ContactController();

router.get('/', requireAuth, requireRole('admin'), controller.getAllContacts); // get all contacts {admin}
router.post('/', controller.createContact); // create contact {all}
router.delete('/:id', requireAuth, requireRole('admin'), controller.deleteContact); // delete contact {admin}

export default router;