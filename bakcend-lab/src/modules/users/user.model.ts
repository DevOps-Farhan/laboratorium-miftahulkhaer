import type { User } from "../../../generated/prisma/client";
import type { Roles, Status } from "../../../generated/prisma/enums";

export type LoginUserRequest = {
    email: string;
    password: string;
}

export type UpdateUserRequest = {
    name?: string;
    password?: string;
}

export type UserResponse = {
    email: string;
    name: string | null;
    role: Roles;
    status: Status;
    token: string;
}

export function toUserResponse(user: User): UserResponse {
    return {
        email: user.email,
        name: user.name,
        role: user.role,
        status: user.status,
        token: user.token!
    }
}

