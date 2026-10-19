import type { Request, Response } from 'express';
import { UserService } from './user.service.js';
import { UserInterfaceWithoutID } from './user.types.js';
import { AuthRequest } from '../auth/auth.middleware.js';
import { UserRole } from '../auth/auth.types.js';
import { BranchRepository } from '../branch/branch.repository.js';
import { BadRequestStatus, CheckId, ConflictStatus, CreateStatus, DeletedStatus, ForbiddenStatus, NotFoundStatus, SuccessStatus, UnauthorizedStatus } from '../../utils/response.js';

const USER_ROLES: UserRole[] = ['customer', 'staff', 'admin', 'branch_admin'];

const service = UserService();
const branchRepo = BranchRepository();

const currentUser = (req: Request) => (req as AuthRequest).user;

/**
 * Reads the optional branch assignment off the body: undefined = leave alone,
 * null = clear, anything else must be a positive branch id.
 */
const readBranchId = (raw: unknown): number | null | undefined => {
    if (raw === undefined) return undefined;
    if (raw === null || raw === "") return null;
    return Number(raw);
};

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
        const authed = currentUser(req);
        if (authed?.role !== 'admin' && authed?.id !== id) {
            return ForbiddenStatus(res, 'Forbidden');
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
        if (req.body.role !== undefined && !USER_ROLES.includes(req.body.role)) {
            return BadRequestStatus(res, 'Invalid role');
        }
        const branchId = readBranchId(req.body.branchId);
        if (branchId !== undefined && branchId !== null && (!Number.isInteger(branchId) || branchId <= 0)) {
            return BadRequestStatus(res, 'Invalid branchId');
        }
        const role: string = req.body.role ?? 'customer';
        if (role === 'branch_admin' && !branchId) {
            return BadRequestStatus(res, 'A branch admin must be assigned to a branch');
        }
        const password: string | null = req.body.password ?? null;
        if (password !== null && (typeof password !== 'string' || password.length < 8)) {
            return BadRequestStatus(res, 'Password must be at least 8 characters');
        }
        if (branchId && !(await branchRepo.getBranchByID(branchId))) {
            return NotFoundStatus(res, 'Branch not found');
        }
        // Stored lowercase so it matches what /auth/login looks up (it lowercases input).
        const email = typeof req.body.email === 'string' ? req.body.email.trim().toLowerCase() : req.body.email;
        const user: UserInterfaceWithoutID = {
            name: req.body.name,
            email,
            phone: req.body.phone ?? null,
            provider: req.body.provider ?? 'email',
            providerID: req.body.providerID ?? null,
            role,
            branchId: branchId ?? null,
            avatar: req.body.avatar ?? null,
            gender: req.body.gender ?? null,
            birthdate: req.body.birthdate ? new Date(req.body.birthdate) : null,
            isEmailVerified: req.body.isEmailVerified ?? false,
            isPhoneVerified: req.body.isPhoneVerified ?? false,
            isActive: req.body.isActive ?? true,
            password,
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

        const authed = currentUser(req);
        if (!authed) {
            return UnauthorizedStatus(res, 'Authentication required');
        }
        if (authed.role !== 'admin' && authed.id !== id) {
            return ForbiddenStatus(res, 'Forbidden');
        }
        if (authed.role !== 'admin' && req.body.role !== undefined) {
            return ForbiddenStatus(res, 'You cannot change your own role');
        }
        if (authed.role !== 'admin' && req.body.branchId !== undefined) {
            return ForbiddenStatus(res, 'You cannot change your own branch');
        }
        if (req.body.role !== undefined && !USER_ROLES.includes(req.body.role)) {
            return BadRequestStatus(res, 'Invalid role');
        }
        if (authed.role === 'admin' && authed.id === id && req.body.role !== undefined && req.body.role !== 'admin') {
            return BadRequestStatus(res, 'You cannot demote your own account');
        }

        const branchId = readBranchId(req.body.branchId);
        if (branchId !== undefined && branchId !== null && (!Number.isInteger(branchId) || branchId <= 0)) {
            return BadRequestStatus(res, 'Invalid branchId');
        }
        if (branchId && !(await branchRepo.getBranchByID(branchId))) {
            return NotFoundStatus(res, 'Branch not found');
        }

        // The users_branch_admin_requires_branch_check constraint refuses a
        // branch admin without a branch; resolve what the row WOULD become so
        // the caller gets a 400 here instead of a 500 from Postgres.
        if (req.body.role !== undefined || req.body.branchId !== undefined) {
            const existing = await service.getUserByID(id);
            if (existing === null) {
                return NotFoundStatus(res, 'User not found');
            }
            const effectiveRole: string = req.body.role ?? existing.role;
            const effectiveBranch = branchId !== undefined ? branchId : existing.branch_id;
            if (effectiveRole === 'branch_admin' && !effectiveBranch) {
                return BadRequestStatus(res, 'A branch admin must be assigned to a branch');
            }
        }

        // fields are passed through without defaults so partial updates fall back to the existing row in the repository
        const email = typeof req.body.email === 'string' ? req.body.email.trim().toLowerCase() : req.body.email;
        const user: UserInterfaceWithoutID = {
            name: req.body.name,
            email,
            phone: req.body.phone ?? null,
            provider: req.body.provider,
            providerID: req.body.providerID ?? null,
            role: req.body.role,
            branchId,
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
        const authed = currentUser(req);
        if (authed?.id === id) {
            return BadRequestStatus(res, 'You cannot delete your own account');
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