import { SetMetadata } from '@nestjs/common';

// This simply attaches the string 'admin' to the metadata of the route
export const Roles = (...roles: string[]) => SetMetadata('roles', roles);