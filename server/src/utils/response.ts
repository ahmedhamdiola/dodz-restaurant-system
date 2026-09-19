import { Response } from "express";

//UTILS

const GenerateStatus = (res: Response, statusCode: number, success: boolean, message?: string, data?: unknown,) => {
    return res.status(statusCode).json({
        success,
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

export const InternalServerErrorStatus = (res: Response, message: string) => {
    return GenerateStatus(res, 500, false, message);
};
export const NotFoundStatus = (res: Response, message: string) => {
    return GenerateStatus(res, 404, false, message);
};
export const BadRequestStatus = (res: Response, message: string) => {
    return GenerateStatus(res, 400, false, message);
};
export const UnauthorizedStatus = (res: Response, message: string) => {
    return GenerateStatus(res, 401, false, message);
};
export const ConflictStatus = (res: Response, message: string) => {
    return GenerateStatus(res, 409, false, message);
};
