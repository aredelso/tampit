"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const bcrypt = __importStar(require("bcryptjs"));
const jwt = __importStar(require("jsonwebtoken"));
const google_auth_library_1 = require("google-auth-library");
const prisma_service_1 = require("../prisma/prisma.service");
const email_service_1 = require("../email/email.service");
const JWT_SECRET = process.env.JWT_SECRET ?? 'dev-secret-change-in-prod';
let AuthService = class AuthService {
    constructor(prisma, email) {
        this.prisma = prisma;
        this.email = email;
    }
    async register(name, email, password, userType = 'STANDARD', roasterId) {
        const passwordHash = await bcrypt.hash(String(password), 10);
        try {
            const user = await this.prisma.user.create({
                data: {
                    name: name ? String(name) : null,
                    email: String(email),
                    passwordHash,
                    userType,
                    roasterId: roasterId ?? undefined,
                },
                select: {
                    id: true,
                    email: true,
                    name: true,
                    photo: true,
                    roasterId: true,
                    userType: true,
                },
            });
            const appUrl = process.env.APP_URL || 'http://localhost:3000';
            if (user.email) {
                const shouldSendVerification = await this.shouldSendVerificationEmail(user.email, userType, roasterId ?? undefined);
                if (shouldSendVerification) {
                    await this.email.sendVerificationEmail(user.email, appUrl);
                }
            }
            const token = jwt.sign({
                userId: user.id,
                roasterId: user.roasterId,
                email: user.email,
                name: user.name,
                userType: user.userType,
            }, JWT_SECRET, { expiresIn: '7d' });
            return {
                token,
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    roasterId: user.roasterId,
                    photo: user.photo ?? null,
                    userType: user.userType,
                },
            };
        }
        catch (err) {
            if (err?.code === 'P2002')
                throw new common_1.ConflictException('Email already in use');
            throw err;
        }
    }
    async shouldSendVerificationEmail(email, userType, roasterId) {
        // Always send for standard users
        if (userType === 'STANDARD')
            return true;
        // For roaster users, only send if email domain matches roaster contact email domain
        if (!roasterId)
            return true; // Send if no roaster selected (shouldn't happen)
        const roaster = await this.prisma.roaster.findUnique({
            where: { id: roasterId },
            select: { contactEmail: true },
        });
        if (!roaster?.contactEmail)
            return true; // Send if roaster has no contact email configured
        const emailDomain = email.split('@')[1]?.toLowerCase();
        const roasterDomain = roaster.contactEmail.split('@')[1]?.toLowerCase();
        return emailDomain === roasterDomain;
    }
    async login(email, password) {
        const user = await this.prisma.user.findUnique({
            where: { email: String(email) },
            select: {
                id: true,
                email: true,
                name: true,
                photo: true,
                roasterId: true,
                userType: true,
                passwordHash: true,
                verified: true,
            },
        });
        if (!user?.passwordHash)
            throw new common_1.UnauthorizedException('Invalid credentials');
        if (!user.verified)
            throw new common_1.UnauthorizedException('Email not verified');
        const valid = await bcrypt.compare(String(password), user.passwordHash);
        if (!valid)
            throw new common_1.UnauthorizedException('Invalid credentials');
        const token = jwt.sign({
            userId: user.id,
            roasterId: user.roasterId,
            email: user.email,
            name: user.name,
            userType: user.userType,
        }, JWT_SECRET, { expiresIn: '7d' });
        return {
            token,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                roasterId: user.roasterId,
                photo: user.photo,
                userType: user.userType,
            },
        };
    }
    async sendVerificationEmail(email) {
        const appUrl = process.env.APP_URL || 'http://localhost:3000';
        await this.email.sendVerificationEmail(email, appUrl);
    }
    async verifyEmail(token) {
        const email = await this.email.verifyToken(token);
        if (!email)
            throw new common_1.BadRequestException('Invalid or expired token');
        const user = await this.prisma.user.findUnique({
            where: { email },
        });
        if (!user)
            throw new common_1.BadRequestException('User not found');
        await this.prisma.user.update({
            where: { email },
            data: { verified: true },
        });
        return { success: true, email };
    }
    async unverifyEmail(email) {
        const user = await this.prisma.user.findUnique({
            where: { email: String(email) },
        });
        if (!user)
            throw new common_1.BadRequestException('User not found');
        await this.prisma.user.update({
            where: { email: String(email) },
            data: { verified: false },
        });
        return { success: true, email };
    }
    async googleAuth(idToken) {
        const googleClient = new google_auth_library_1.OAuth2Client(process.env.GOOGLE_CLIENT_ID);
        const ticket = await googleClient.verifyIdToken({
            idToken,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        if (!payload?.email)
            throw new common_1.UnauthorizedException('Invalid Google token');
        let user = await this.prisma.user.findFirst({
            where: {
                OR: [{ googleId: payload.sub }, { email: payload.email }],
            },
            select: {
                id: true,
                email: true,
                name: true,
                photo: true,
                roasterId: true,
                userType: true,
                googleId: true,
            },
        });
        if (user) {
            if (!user.googleId) {
                user = await this.prisma.user.update({
                    where: { id: user.id },
                    data: { googleId: payload.sub, verified: true },
                    select: {
                        id: true,
                        email: true,
                        name: true,
                        photo: true,
                        roasterId: true,
                        userType: true,
                        googleId: true,
                    },
                });
            }
        }
        else {
            user = await this.prisma.user.create({
                data: {
                    email: payload.email,
                    name: payload.name ?? null,
                    photo: payload.picture ?? null,
                    googleId: payload.sub,
                    verified: true,
                },
                select: {
                    id: true,
                    email: true,
                    name: true,
                    photo: true,
                    roasterId: true,
                    userType: true,
                    googleId: true,
                },
            });
        }
        const token = jwt.sign({
            userId: user.id,
            roasterId: user.roasterId,
            email: user.email,
            name: user.name,
            userType: user.userType,
        }, JWT_SECRET, { expiresIn: '7d' });
        return {
            token,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                roasterId: user.roasterId,
                photo: user.photo ?? null,
                userType: user.userType,
            },
        };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        email_service_1.EmailService])
], AuthService);
