"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JwtGuard = void 0;
const common_1 = require("@nestjs/common");
const graphql_1 = require("@nestjs/graphql");
const extract_user_1 = require("./extract-user");
let JwtGuard = class JwtGuard {
    canActivate(context) {
        try {
            const gqlContext = graphql_1.GqlExecutionContext.create(context);
            const request = gqlContext.getContext().req;
            const token = (0, extract_user_1.extractToken)(request);
            request.user = { id: token.userId, userType: token.userType };
            return true;
        }
        catch {
            const request = context.switchToHttp().getRequest();
            const token = (0, extract_user_1.extractToken)(request);
            request.user = { id: token.userId, userType: token.userType };
            return true;
        }
    }
};
exports.JwtGuard = JwtGuard;
exports.JwtGuard = JwtGuard = __decorate([
    (0, common_1.Injectable)()
], JwtGuard);
