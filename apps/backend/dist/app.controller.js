"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const app_service_1 = require("./app.service");
const user_dto_1 = require("./user.dto");
let AppController = class AppController {
    constructor(appService) {
        this.appService = appService;
    }
    async healthCheck() {
        return 'OK';
    }
    async signIn(signInDto) {
        return await this.appService.signIn(signInDto);
    }
    async getUser(token) {
        return this.appService.getUser(token);
    }
    async getLeaderboard(token) {
        return this.appService.getLeaderboard(token);
    }
    async updateUserPoint(token, updateUserPointDto) {
        return this.appService.updatePoint(token, updateUserPointDto.point);
    }
    async test() {
        await this.appService.addNewUsers();
        await this.appService.updateLeaderboard();
        return 'success';
    }
    async swapPointToTicket(token, swapPointToTicketDto) {
        return this.appService.swapPointToTicket(token, swapPointToTicketDto.ticketCount);
    }
};
exports.AppController = AppController;
__decorate([
    (0, common_1.Get)('/'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AppController.prototype, "healthCheck", null);
__decorate([
    (0, common_1.Post)('/auth/signin'),
    (0, swagger_1.ApiOperation)({ summary: 'Sign in with Telegram' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Success', type: user_dto_1.SignInResponseDto }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_dto_1.SignInRequestDto]),
    __metadata("design:returntype", Promise)
], AppController.prototype, "signIn", null);
__decorate([
    (0, common_1.Get)('/user'),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, swagger_1.ApiOperation)({ summary: 'Get user information' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Success', type: user_dto_1.UserResponseDto }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    __param(0, (0, common_1.Headers)('authorization')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AppController.prototype, "getUser", null);
__decorate([
    (0, common_1.Get)('/leaderboard'),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, swagger_1.ApiOperation)({ summary: 'Get leaderboard' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Success', type: user_dto_1.GetLeaderboardResponseDto }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    __param(0, (0, common_1.Headers)('authorization')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AppController.prototype, "getLeaderboard", null);
__decorate([
    (0, common_1.Put)('/point'),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, swagger_1.ApiOperation)({ summary: 'Update user points' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Success', type: user_dto_1.UpdateUserPointResponseDto }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    __param(0, (0, common_1.Headers)('authorization')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, user_dto_1.UpdateUserPointRequestDto]),
    __metadata("design:returntype", Promise)
], AppController.prototype, "updateUserPoint", null);
__decorate([
    (0, common_1.Get)('/test'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AppController.prototype, "test", null);
__decorate([
    (0, common_1.Post)('/swap-point-to-ticket'),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, swagger_1.ApiOperation)({ summary: 'Swap point to ticket' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Success', type: user_dto_1.SwapPointToTicketResponseDto }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    __param(0, (0, common_1.Headers)('authorization')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, user_dto_1.SwapPointToTicketRequestDto]),
    __metadata("design:returntype", Promise)
], AppController.prototype, "swapPointToTicket", null);
exports.AppController = AppController = __decorate([
    (0, swagger_1.ApiTags)('YBDBD TMA'),
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [app_service_1.AppService])
], AppController);
//# sourceMappingURL=app.controller.js.map