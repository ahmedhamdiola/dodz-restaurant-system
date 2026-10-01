import { Response } from "express";

//UTILS

const GenerateStatus = (res: Response, statusCode: number, success: boolean, message?: string, data?: unknown,) => {
    return res.status(statusCode).json({
        success,
        message,
        data
    });
};

/**
 * Error responses carry an optional `data` payload so a client can react
 * programmatically (e.g. which cart lines failed re-validation) while the
 * `message` stays the human-readable string shown in the UI.
 */
export const ErrorStatus = (res: Response, statusCode: number, message: string, data?: unknown) => {
    return res.status(statusCode).json({
        success: false,
        message,
        data
    });
};

export const CheckId = (id: number) => {
    return !isNaN(id) && id > 0;
};




// SUCCESS STATUS

export const CreateStatus = (res: Response, data: unknown) => {
    return GenerateStatus(res, 201, true, undefined, data);
};
export const SuccessStatus = (res: Response, data: unknown) => {
    return GenerateStatus(res, 200, true, undefined, data);
};
export const DeletedStatus = (res: Response, message: string) => {
    return GenerateStatus(res, 204, true, message);
};

// ERROR STATUS

export const InternalServerErrorStatus = (res: Response, message: string, data?: unknown) => {
    return ErrorStatus(res, 500, message, data);
};
export const NotFoundStatus = (res: Response, message: string, data?: unknown) => {
    return ErrorStatus(res, 404, message, data);
};
export const BadRequestStatus = (res: Response, message: string, data?: unknown) => {
    return ErrorStatus(res, 400, message, data);
};
export const UnauthorizedStatus = (res: Response, message: string, data?: unknown) => {
    return ErrorStatus(res, 401, message, data);
};
export const ForbiddenStatus = (res: Response, message: string, data?: unknown) => {
    return ErrorStatus(res, 403, message, data);
};
export const ConflictStatus = (res: Response, message: string, data?: unknown) => {
    return ErrorStatus(res, 409, message, data);
};
