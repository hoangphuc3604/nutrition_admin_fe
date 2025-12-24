export enum UserRole {
  ADMIN = "admin",
  USER = "user",
  MODERATOR = "moderator",
  GUEST = "guest",
}

export const RoleLabels: Record<UserRole, string> = {
  [UserRole.ADMIN]: "Admin",
  [UserRole.MODERATOR]: "Moderator",
  [UserRole.USER]: "User",
  [UserRole.GUEST]: "Guest",
};

export const RoleHierarchy: Record<UserRole, number> = {
  [UserRole.ADMIN]: 4,
  [UserRole.MODERATOR]: 3,
  [UserRole.USER]: 2,
  [UserRole.GUEST]: 1,
};

export function isValidRole(value: string): value is UserRole {
  return Object.values(UserRole).includes(value as UserRole);
}

export function getRoleLabel(role: string): string {
  return isValidRole(role) ? RoleLabels[role] : role;
}

export function getRoleVariant(role: string): 'default' | 'secondary' {
  if (role === UserRole.ADMIN) return 'default';
  if (role === UserRole.MODERATOR) return 'default';
  return 'secondary';
}

