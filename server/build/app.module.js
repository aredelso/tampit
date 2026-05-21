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
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const bcrypt = __importStar(require("bcryptjs"));
const graphql_1 = require("@nestjs/graphql");
const apollo_1 = require("@nestjs/apollo");
const prisma_module_1 = require("./prisma/prisma.module");
const prisma_service_1 = require("./prisma/prisma.service");
const ws_module_1 = require("./ws/ws.module");
const auth_module_1 = require("./auth/auth.module");
const entries_module_1 = require("./entries/entries.module");
const users_module_1 = require("./users/users.module");
const roasters_module_1 = require("./roasters/roasters.module");
const seed_module_1 = require("./seed/seed.module");
const uploads_module_1 = require("./uploads/uploads.module");
const coffees_module_1 = require("./coffees/coffees.module");
const tags_module_1 = require("./tags/tags.module");
const wishlist_module_1 = require("./wishlist/wishlist.module");
const recipes_module_1 = require("./recipes/recipes.module");
const follows_module_1 = require("./follows/follows.module");
const email_module_1 = require("./email/email.module");
const inventory_module_1 = require("./inventory/inventory.module");
let AppModule = class AppModule {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async onApplicationBootstrap() {
        const exists = await this.prisma.user.findUnique({
            where: { email: 'dev@dev.com' },
        });
        if (!exists) {
            await this.prisma.user.create({
                data: {
                    email: 'dev@dev.com',
                    passwordHash: await bcrypt.hash('password', 10),
                    name: 'Dev',
                },
            });
        }
    }
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            graphql_1.GraphQLModule.forRoot({
                driver: apollo_1.ApolloDriver,
                typePaths: ['src/**/*.gql'],
                context: ({ req }) => ({ req }),
            }),
            prisma_module_1.PrismaModule,
            ws_module_1.WsModule,
            auth_module_1.AuthModule,
            entries_module_1.EntriesModule,
            users_module_1.UsersModule,
            roasters_module_1.RoastersModule,
            seed_module_1.SeedModule,
            uploads_module_1.UploadsModule,
            coffees_module_1.CoffeesModule,
            tags_module_1.TagsModule,
            wishlist_module_1.WishlistModule,
            recipes_module_1.RecipesModule,
            follows_module_1.FollowsModule,
            email_module_1.EmailModule,
            inventory_module_1.InventoryModule,
        ],
    }),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AppModule);
