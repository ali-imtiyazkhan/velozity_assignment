import { PrismaClient } from "./prisma/generated/client/client";
import { PrismaPg } from "@prisma/adapter-pg";
import * as enums from "./prisma/generated/client/enums";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

export type { PrismaClient };
export type Role = enums.Role;
export type TaskStatus = enums.TaskStatus;
export type Priority = enums.Priority;
export type NotificationType = enums.NotificationType;
export const Role = enums.Role;
export const TaskStatus = enums.TaskStatus;
export const Priority = enums.Priority;
export const NotificationType = enums.NotificationType;

export default prisma;