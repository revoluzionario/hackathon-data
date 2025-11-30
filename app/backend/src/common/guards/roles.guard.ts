import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.get<string[]>('roles', context.getHandler())
      ?? this.reflector.get<string[]>('roles', context.getClass());
    if (!required || required.length === 0) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    if (!user) {
      return false;
    }

    if (user.role && required.includes(user.role)) {
      return true;
    }

    if (Array.isArray(user.roles)) {
      return required.some((role) => user.roles.includes(role));
    }

    return false;
  }
}
