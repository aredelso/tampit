import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { extractToken } from './extract-user';

@Injectable()
export class JwtGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    try {
      const gqlContext = GqlExecutionContext.create(context);
      const request = gqlContext.getContext().req;
      const token = extractToken(request);
      request.user = { id: token.userId, userType: token.userType };
      return true;
    } catch {
      const request = context.switchToHttp().getRequest();
      const token = extractToken(request);
      request.user = { id: token.userId, userType: token.userType };
      return true;
    }
  }
}
