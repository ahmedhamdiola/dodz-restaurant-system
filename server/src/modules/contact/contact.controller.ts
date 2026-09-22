import type { Request, Response } from 'express';
import { ContactService } from './contact.service.js';
import { ContactInterfaceWithoutID } from './contact.types.js';
import { BadRequestStatus, CheckId, CreateStatus, DeletedStatus, NotFoundStatus, SuccessStatus } from '../../utils/response.js';

const service = ContactService();

export const ContactController = () => {
    const getAllContacts = async (req: Request, res: Response) => {
        const contacts = await service.getAllContacts();
        if (contacts === null) {
            return NotFoundStatus(res, 'Contacts not found');
        }
        return SuccessStatus(res, contacts);
    }

    const createContact = async (req: Request, res: Response) => {
        const contact: ContactInterfaceWithoutID = {
            name: req.body.name,
            email: req.body.email,
            phone: req.body.phone,
            subject: req.body.subject,
            message: req.body.message,
        };
        if (!contact.name || !contact.email || !contact.phone || !contact.subject || !contact.message) {
            return BadRequestStatus(res, 'Invalid contact data');
        }
        const result = await service.createContact(contact);
        if (result === null) {
            return NotFoundStatus(res, 'Unable to create contact');
        }
        return CreateStatus(res, result);
    }

    const deleteContact = async (req: Request, res: Response) => {
        const id = Number(req.params.id);
        if (!CheckId(id)) {
            return BadRequestStatus(res, "Invalid contact id");
        }
        const result = await service.deleteContact(id);
        if (result === null) {
            return NotFoundStatus(res, 'Contact not found');
        }
        return DeletedStatus(res, 'Contact deleted');
    }

    return {
        getAllContacts,
        createContact,
        deleteContact,
    };
};