"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoastersModule = void 0;
const common_1 = require("@nestjs/common");
const roasters_controller_1 = require("./roasters.controller");
const roasters_service_1 = require("./roasters.service");
const entries_module_1 = require("../entries/entries.module");
const ai_module_1 = require("../ai/ai.module");
let RoastersModule = class RoastersModule {
};
exports.RoastersModule = RoastersModule;
exports.RoastersModule = RoastersModule = __decorate([
    (0, common_1.Module)({
        imports: [entries_module_1.EntriesModule, ai_module_1.AiModule],
        controllers: [roasters_controller_1.RoastersController],
        providers: [roasters_service_1.RoastersService],
    })
], RoastersModule);
