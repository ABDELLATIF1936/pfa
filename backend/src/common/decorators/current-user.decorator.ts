import { createParamDecorator, ExecutionContext } from '@nestjs/common';

// Extrait uniquement l'utilisateur placé dans request par JwtStrategy.
export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext) =>
    context.switchToHttp().getRequest().user,
);