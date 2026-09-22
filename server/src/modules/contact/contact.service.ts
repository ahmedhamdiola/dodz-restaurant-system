import { ContactRepository } from "./contact.repository.js";
import { ContactInterfaceWithoutID } from "./contact.types.js";

export const ContactService = () => {
    const repository = ContactRepository();

    const getAllContacts = async () => {
        return repository.getAllContacts();
    }

    const createContact = async (contact: ContactInterfaceWithoutID) => {
        return repository.createContact(contact);
    }

    const deleteContact = async (id: number) => {
        const existingContact = await repository.getContactByID(id);
        if (!existingContact) {
            return null;
        }

        return repository.deleteContact(id);
    }

    return {
        getAllContacts,
        createContact,
        deleteContact,
    };
};