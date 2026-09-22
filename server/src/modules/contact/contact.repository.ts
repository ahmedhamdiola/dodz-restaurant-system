import { pool } from "../../config/database.js";
import { ContactInterfaceWithoutID } from "./contact.types.js";
export const ContactRepository = () => {
    const getContactByID = async (id: number) => {
        const result = await pool.query(`SELECT * FROM contact WHERE id = $1`, [id]);
        return result.rows[0] ?? null;
    }

    const getAllContacts = async () => {
        const result = await pool.query(`SELECT * FROM contact ORDER BY created_at DESC`);
        return result.rows;
    }

    const createContact = async (contact: ContactInterfaceWithoutID) => {
        const result = await pool.query(`INSERT INTO contact (name, email, phone, subject, message) VALUES ($1, $2, $3, $4, $5) RETURNING *`, [
            contact.name,
            contact.email,
            contact.phone,
            contact.subject,
            contact.message,
        ]);
        return result.rows[0] ?? null;
    }

    const deleteContact = async (id: number) => {
        const result = await pool.query(`DELETE FROM contact WHERE id = $1 RETURNING id`, [id]);
        return result.rows[0] ?? null;
    }

    return {
        getContactByID,
        getAllContacts,
        createContact,
        deleteContact,
    };
};