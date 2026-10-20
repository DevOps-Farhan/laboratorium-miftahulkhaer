import type { User } from "../../../generated/prisma/client";
import type { Roles, Status } from "../../../generated/prisma/enums";

export type SearchUsersRequest = {
    page: number;
    size: number;
    role? : Roles;
    status? : Status;
    search? : string;
}

export type CreateUsersRequest = {
    email: string;
    name?: string;
    role: Roles;
    status: Status;
    password: string;
}

export type UpdateUsersRequest = {
    email?: string;
    name?: string;
    role?: Roles;
    status?: Status;
    password?: string;
}

export type UsersResponse = {
    id: number,
    email: string;
    name: string | null;
    role: Roles;
    status: Status;
}

export type Paging = {
  page: number;
  size: number;
  total_item: number;
  total_page: number;
};

export type UsersListResponse = {
  data: UsersResponse[];
  paging: Paging;
};

export function toUsersListResponse(users: Pick<User, "id" | "email" | "name" | "role" | "status">): UsersResponse {
    return{
        id: users.id,
        email: users.email,
        name: users.name,
        role: users.role,
        status: users.status,
    }
}

export function toUsersResponse(users: User): UsersResponse {
    return {
        id: users.id,
        email: users.email,
        name: users.name,
        role: users.role,
        status: users.status,
    }
}