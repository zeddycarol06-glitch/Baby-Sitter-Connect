import type { SessionUser } from "@/types";

export interface DemoUser extends SessionUser {
  password: string;
  phone?: string;
  avatarUrl?: string;
}

export const DEMO_USERS: DemoUser[] = [
  {
    id: "usr_parent_1",
    email: "parent@example.com",
    password: "password123",
    firstName: "Alex",
    lastName: "Morgan",
    role: "parent",
    phone: "(206) 555-0142",
    avatarUrl: "/avatars/alex.svg",
  },
  {
    id: "usr_sitter_maya",
    email: "maya@example.com",
    password: "password123",
    firstName: "Maya",
    lastName: "Thompson",
    role: "sitter",
    phone: "(206) 555-0188",
    avatarUrl: "/avatars/maya.svg",
  },
  {
    id: "usr_admin_1",
    email: "admin@example.com",
    password: "password123",
    firstName: "Riley",
    lastName: "Chen",
    role: "admin",
    phone: "(206) 555-0100",
    avatarUrl: "/avatars/riley.svg",
  },
];

const globalForUsers = globalThis as unknown as { __bsRegisteredUsers?: DemoUser[] };
const registeredUsers = (globalForUsers.__bsRegisteredUsers ??= []);

export function allUsers(): DemoUser[] {
  return [...DEMO_USERS, ...registeredUsers];
}

export function findUserByEmail(email: string): DemoUser | undefined {
  return allUsers().find((user) => user.email.toLowerCase() === email.toLowerCase());
}

export function findUserById(id: string): DemoUser | undefined {
  return allUsers().find((user) => user.id === id);
}

export function addRegisteredUser(user: DemoUser): void {
  registeredUsers.push(user);
}

export function toSessionUser(user: DemoUser): SessionUser {
  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role,
    avatarUrl: user.avatarUrl,
  };
}
