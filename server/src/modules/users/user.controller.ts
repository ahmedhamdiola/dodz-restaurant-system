import type { Request, Response } from 'express';
import { UserService } from './user.service.js';
import { UserInterfaceWithoutID } from './user.types.js';
import { BadRequestStatus, CheckId, ConflictStatus, CreateStatus, DeletedStatus, NotFoundStatus, SuccessStatus } from '../../utils/response.js';

const service = UserService();

export const UserController = () => {
    const getUsers = async (req: Request, res: Response) => {
        const limit = Math.max(Number(req.query.limit) || 50, 1);
        const offset = Math.max(Number(req.query.offset) || 0, 0);
        const users = await service.getUsers(limit, offset);
        return SuccessStatus(res, users);
    }

    const getUserByID = async (req: Request, res: Response) => {
        const id = Number(req.params.id);
        if (!CheckId(id)) {
            return BadRequestStatus(res, "Invalid user id");
        }
        const user = await service.getUserByID(id);
        if (user === null) {
            return NotFoundStatus(res, 'User not found');
        }
        return SuccessStatus(res, user);
    }

    const getUserByEmail = async (req: Request, res: Response) => {
        const email = req.params.email as string;
        if (!email) {
            return BadRequestStatus(res, "Invalid email");
        }
        const user = await service.getUserByEmail(email);
        if (user === null) {
            return NotFoundStatus(res, 'User not found');
        }
        return SuccessStatus(res, user);
    }

    const createUser = async (req: Request, res: Response) => {
        const user: UserInterfaceWithoutID = {
            name: req.body.name,
            email: req.body.email,
            phone: req.body.phone ?? null,
            provider: req.body.provider ?? 'email',
            providerID: req.body.providerID ?? null,
            role: req.body.role ?? 'customer',
            avatar: req.body.avatar ?? null,
            gender: req.body.gender ?? null,
            birthdate: req.body.birthdate ? new Date(req.body.birthdate) : null,
            isEmailVerified: req.body.isEmailVerified ?? false,
            isPhoneVerified: req.body.isPhoneVerified ?? false,
            isActive: req.body.isActive ?? true,
        };
        if (!user.name || !user.email || (user.birthdate && isNaN(user.birthdate.getTime()))) {
            return BadRequestStatus(res, 'Invalid user data');
        }
        const result = await service.createUser(user);
        if (result === null) {
            return ConflictStatus(res, 'Email or phone already in use');
        }
        return CreateStatus(res, result);
    }

    const updateUser = async (req: Request, res: Response) => {
        const id = Number(req.params.id);
        if (!CheckId(id)) {
            return BadRequestStatus(res, "Invalid user id");
        }

        // fields are passed through without defaults so partial updates fall back to the existing row in the repository
        const user: UserInterfaceWithoutID = {
            name: req.body.name,
            email: req.body.email,
            phone: req.body.phone ?? null,
            provider: req.body.provider,
            providerID: req.body.providerID ?? null,
            role: req.body.role,
            avatar: req.body.avatar ?? null,
            gender: req.body.gender ?? null,
            birthdate: req.body.birthdate ? new Date(req.body.birthdate) : null,
            isEmailVerified: req.body.isEmailVerified,
            isPhoneVerified: req.body.isPhoneVerified,
            isActive: req.body.isActive,
        };
        if ((user.name !== undefined && !user.name) || (user.email !== undefined && !user.email) || (user.birthdate && isNaN(user.birthdate.getTime()))) {
            return BadRequestStatus(res, 'Invalid user data');
        }
        const result = await service.updateUser(id, user);
        if (result === null) {
            return NotFoundStatus(res, 'User not found');
        }
        if (result === false) {
            return ConflictStatus(res, 'Email or phone already in use');
        }
        return SuccessStatus(res, result);
    }

    const deleteUser = async (req: Request, res: Response) => {
        const id = Number(req.params.id);
        if (!CheckId(id)) {
            return BadRequestStatus(res, "Invalid user id");
        }
        const result = await service.deleteUser(id);
        if (result === null) {
            return NotFoundStatus(res, 'User not found');
        }
        return DeletedStatus(res, 'User deleted');
    }

    return {
        getUsers,
        getUserByID,
        getUserByEmail,
        createUser,
        updateUser,
        deleteUser,
    };
};