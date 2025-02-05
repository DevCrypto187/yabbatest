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
Object.defineProperty(exports, "__esModule", { value: true });
exports.SwapPointToTicketResponseDto = exports.SwapPointToTicketRequestDto = exports.GetLeaderboardResponseDto = exports.UpdateUserPointResponseDto = exports.UpdateUserPointRequestDto = exports.UserResponseDto = exports.SignInResponseDto = exports.SignInRequestDto = void 0;
const swagger_1 = require("@nestjs/swagger");
class SignInRequestDto {
}
exports.SignInRequestDto = SignInRequestDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Telegram username' }),
    __metadata("design:type", String)
], SignInRequestDto.prototype, "username", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Telegram user ID' }),
    __metadata("design:type", String)
], SignInRequestDto.prototype, "tgUserId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Invitation code (optional)', required: false }),
    __metadata("design:type", String)
], SignInRequestDto.prototype, "inviteCode", void 0);
class SignInResponseDto {
}
exports.SignInResponseDto = SignInResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'JWT token', required: false }),
    __metadata("design:type", String)
], SignInResponseDto.prototype, "token", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Success status' }),
    __metadata("design:type", Boolean)
], SignInResponseDto.prototype, "success", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Error message (if any)', required: false }),
    __metadata("design:type", String)
], SignInResponseDto.prototype, "message", void 0);
class UserResponseDto {
}
exports.UserResponseDto = UserResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Username', required: false }),
    __metadata("design:type", String)
], UserResponseDto.prototype, "username", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Invitation code', required: false }),
    __metadata("design:type", String)
], UserResponseDto.prototype, "inviteCode", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Point', required: false }),
    __metadata("design:type", Number)
], UserResponseDto.prototype, "point", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Ticket count', required: false }),
    __metadata("design:type", Number)
], UserResponseDto.prototype, "ticketCount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Invited user count', required: false }),
    __metadata("design:type", Number)
], UserResponseDto.prototype, "invitedUserCount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Success status' }),
    __metadata("design:type", Boolean)
], UserResponseDto.prototype, "success", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Error message (if any)', required: false }),
    __metadata("design:type", String)
], UserResponseDto.prototype, "message", void 0);
class UpdateUserPointRequestDto {
}
exports.UpdateUserPointRequestDto = UpdateUserPointRequestDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Points to add/subtract' }),
    __metadata("design:type", Number)
], UpdateUserPointRequestDto.prototype, "point", void 0);
class UpdateUserPointResponseDto {
}
exports.UpdateUserPointResponseDto = UpdateUserPointResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Success status' }),
    __metadata("design:type", Boolean)
], UpdateUserPointResponseDto.prototype, "success", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Error message (if any)', required: false }),
    __metadata("design:type", String)
], UpdateUserPointResponseDto.prototype, "message", void 0);
class GetLeaderboardResponseDto {
}
exports.GetLeaderboardResponseDto = GetLeaderboardResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Total user count', required: false }),
    __metadata("design:type", Number)
], GetLeaderboardResponseDto.prototype, "totalUserCount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'List of users and their scores',
        required: false,
        type: 'array',
        items: {
            type: 'object',
            properties: {
                username: { type: 'string' },
                userProfile: { type: 'string' },
                score: { type: 'number' },
            },
        },
    }),
    __metadata("design:type", Array)
], GetLeaderboardResponseDto.prototype, "list", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Success status' }),
    __metadata("design:type", Boolean)
], GetLeaderboardResponseDto.prototype, "success", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Error message (if any)', required: false }),
    __metadata("design:type", String)
], GetLeaderboardResponseDto.prototype, "message", void 0);
class SwapPointToTicketRequestDto {
}
exports.SwapPointToTicketRequestDto = SwapPointToTicketRequestDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Ticket count' }),
    __metadata("design:type", Number)
], SwapPointToTicketRequestDto.prototype, "ticketCount", void 0);
class SwapPointToTicketResponseDto {
}
exports.SwapPointToTicketResponseDto = SwapPointToTicketResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Success status' }),
    __metadata("design:type", Boolean)
], SwapPointToTicketResponseDto.prototype, "success", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Error message (if any)', required: false }),
    __metadata("design:type", String)
], SwapPointToTicketResponseDto.prototype, "message", void 0);
//# sourceMappingURL=user.dto.js.map