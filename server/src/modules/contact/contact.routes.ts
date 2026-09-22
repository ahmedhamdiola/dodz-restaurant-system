import { Router } from 'express';
import { ContactController } from './contact.controller.js';

const router = Router();
const controller = ContactController();

router.get('/', controller.getAllContacts); // get all contacts {admin}
router.post('/', controller.createContact); // create contact {all}
router.delete('/:id', controller.deleteContact); // delete contact {admin}

export default router;