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
exports.AppService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const jwt = require("jsonwebtoken");
const config_1 = require("@nestjs/config");
const schedule_1 = require("@nestjs/schedule");
const unique_names_generator_1 = require("unique-names-generator");
let AppService = class AppService {
    constructor(configService) {
        this.configService = configService;
        this.prisma = new client_1.PrismaClient();
    }
    generateToken(userId, tgUserId) {
        return jwt.sign({
            userId,
            tgUserId,
        }, this.configService.get('JWT_SECRET') ?? '', { expiresIn: '24h' });
    }
    verifyToken(token) {
        try {
            token = token.replace('Bearer', '').trim();
            const decoded = jwt.verify(token, this.configService.get('JWT_SECRET') ?? '');
            return decoded;
        }
        catch (error) {
            throw new common_1.UnauthorizedException('Invalid token');
        }
    }
    async signIn(signInDto) {
        try {
            const existingUser = await this.prisma.user.findFirst({
                where: { tgUserId: signInDto.tgUserId },
            });
            if (existingUser) {
                const token = this.generateToken(existingUser.id, existingUser.tgUserId);
                return {
                    token,
                    success: true,
                };
            }
            let inviteeUserId = null;
            if (signInDto.inviteCode) {
                const inviter = await this.prisma.user.findUnique({
                    where: { inviteCode: signInDto.inviteCode },
                });
                if (inviter) {
                    inviteeUserId = inviter.id;
                }
            }
            const newUser = await this.prisma.user.create({
                data: {
                    username: signInDto.username,
                    tgUserId: signInDto.tgUserId,
                    userProfile: '',
                    inviteCode: Math.random().toString(36).substring(3),
                    inviteeUserId,
                },
            });
            const token = this.generateToken(newUser.id, newUser.tgUserId);
            return {
                token,
                success: true,
            };
        }
        catch (error) {
            return {
                success: false,
                message: error.message,
            };
        }
    }
    async getUser(token) {
        try {
            const decoded = this.verifyToken(token);
            const user = await this.prisma.user.findFirst({
                where: { tgUserId: decoded.tgUserId },
                include: {
                    Leaderboard: true,
                    Ticket: true,
                },
            });
            if (!user) {
                return {
                    success: false,
                    message: 'User not found',
                };
            }
            const invitedUsers = await this.prisma.user.findMany({
                where: { inviteeUserId: user.id },
            });
            return {
                username: user.username,
                inviteCode: user.inviteCode,
                point: user.Leaderboard?.score || 0,
                ticketCount: user.Ticket?.count || 0,
                invitedUserCount: invitedUsers.length,
                success: true,
            };
        }
        catch (error) {
            return {
                success: false,
                message: error.message,
            };
        }
    }
    async updatePoint(token, point) {
        try {
            const decoded = this.verifyToken(token);
            const user = await this.prisma.user.findFirst({
                where: { tgUserId: decoded.tgUserId },
            });
            if (!user) {
                return {
                    success: false,
                    message: 'User not found',
                };
            }
            await this.prisma.leaderboard.upsert({
                where: { userId: user.id },
                update: {
                    score: {
                        increment: point,
                    },
                },
                create: {
                    userId: user.id,
                    score: Math.floor(point),
                },
            });
            return {
                success: true,
            };
        }
        catch (error) {
            return {
                success: false,
                message: error.message,
            };
        }
    }
    async getLeaderboard(token) {
        try {
            this.verifyToken(token);
            const totalUserCount = await this.prisma.user.count();
            const leaderboards = await this.prisma.leaderboard.findMany({
                include: {
                    user: true,
                },
                orderBy: {
                    score: 'desc',
                },
                take: 100,
            });
            return {
                totalUserCount,
                list: leaderboards.map((leaderboard, index) => ({
                    username: leaderboard.user.username,
                    userProfile: `https://api.dicebear.com/9.x/pixel-art/svg?seed=${leaderboard.user.username}`,
                    score: leaderboard.score,
                })),
                success: true,
            };
        }
        catch (error) {
            return {
                success: false,
                message: error.message,
            };
        }
    }
    async swapPointToTicket(token, ticketCount) {
        try {
            const decoded = this.verifyToken(token);
            const user = await this.prisma.user.findFirst({
                where: { tgUserId: decoded.tgUserId },
            });
            if (!user) {
                return {
                    success: false,
                    message: 'User not found',
                };
            }
            const leaderboard = await this.prisma.leaderboard.findFirst({
                where: { userId: user.id },
            });
            const totalPoint = leaderboard?.score || 0;
            let decrementPoint = 0;
            switch (ticketCount) {
                case 1:
                    if (totalPoint > 20) {
                        decrementPoint = 20;
                    }
                    break;
                case 3:
                    if (totalPoint > 50) {
                        decrementPoint = 50;
                    }
                    break;
                case 5:
                    if (totalPoint > 100) {
                        decrementPoint = 100;
                    }
                    break;
            }
            if (decrementPoint === 0) {
                return {
                    success: false,
                    message: 'Not enough point',
                };
            }
            if (decrementPoint > 0) {
                await this.prisma.leaderboard.update({
                    where: { userId: user.id },
                    data: {
                        score: {
                            decrement: decrementPoint,
                        },
                    },
                });
                await this.prisma.ticket.upsert({
                    where: { userId: user.id },
                    update: {
                        count: {
                            increment: ticketCount,
                        },
                    },
                    create: {
                        userId: user.id,
                        count: ticketCount,
                    },
                });
            }
            return {
                success: true,
            };
        }
        catch (error) {
            return {
                success: false,
                message: error.message,
            };
        }
    }
    generateRandomUserData() {
        const randomNum = Math.floor(Math.random() * 100000);
        const numberDictionary = unique_names_generator_1.NumberDictionary.generate({ min: 1, max: 99 });
        const cryptoDic = [
            'ninja', 'samurai', 'warrior', 'hunter', 'ranger', 'wizard', 'mage', 'knight', 'rogue', 'archer',
            'paladin', 'druid', 'monk', 'bard', 'cleric', 'sorcerer', 'fighter', 'assassin', 'guardian', 'champion',
            'master', 'hero', 'legend', 'king', 'queen', 'prince', 'princess', 'dragon', 'phoenix', 'unicorn',
            'titan', 'giant', 'elf', 'dwarf', 'orc', 'troll', 'goblin', 'demon', 'angel', 'spirit',
            'shadow', 'storm', 'thunder', 'frost', 'flame', 'blade', 'shield', 'crown', 'star', 'moon',
            'ninja2', 'samurai2', 'warrior2', 'hunter2', 'ranger2', 'wizard2', 'mage2', 'knight2', 'rogue2', 'archer2',
            'paladin2', 'druid2', 'monk2', 'bard2', 'cleric2', 'sorcerer2', 'fighter2', 'assassin2', 'guardian2', 'champion2',
            'master2', 'hero2', 'legend2', 'king2', 'queen2', 'prince2', 'princess2', 'dragon2', 'phoenix2', 'unicorn2',
            'titan2', 'giant2', 'elf2', 'dwarf2', 'orc2', 'troll2', 'goblin2', 'demon2', 'angel2', 'spirit2',
            'shadow2', 'storm2', 'thunder2', 'frost2', 'flame2', 'blade2', 'shield2', 'crown2', 'star2', 'moon2'
        ];
        const dictionaries = [unique_names_generator_1.adjectives];
        if (Math.random() > 0.7) {
            dictionaries.push(unique_names_generator_1.animals);
        }
        if (Math.random() > 0.5) {
            dictionaries.push(unique_names_generator_1.colors);
        }
        if (Math.random() > 0.5) {
            dictionaries.push(numberDictionary);
        }
        if (Math.random() > 0.3) {
            dictionaries.push(cryptoDic);
        }
        for (let i = dictionaries.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [dictionaries[i], dictionaries[j]] = [dictionaries[j], dictionaries[i]];
        }
        const randomName = (0, unique_names_generator_1.uniqueNamesGenerator)({
            dictionaries: dictionaries,
            separator: Math.random() > 0.7 ? '-' : Math.random() > 0.3 ? '_' : '',
            style: Math.random() > 0.7 ? 'capital' : Math.random() > 0.3 ? 'lowerCase' : 'upperCase',
            seed: randomNum
        });
        return {
            username: randomName,
            tgUserId: `rn${Date.now()}${randomNum}`,
            userProfile: '',
            inviteCode: `rn${Math.random().toString(36).substring(3)}`,
        };
    }
    async createRandomUsers(count) {
        const BATCH_SIZE = 1000;
        for (let i = 0; i < count; i += BATCH_SIZE) {
            const batchSize = Math.min(BATCH_SIZE, count - i);
            const userData = Array.from({ length: batchSize }, () => this.generateRandomUserData());
            const users = await this.prisma.user.createMany({
                data: userData,
                skipDuplicates: true,
            });
            const createdUsers = await this.prisma.user.findMany({
                where: {
                    tgUserId: {
                        in: userData.map(u => u.tgUserId)
                    }
                },
                select: { id: true }
            });
            await this.prisma.leaderboard.createMany({
                data: createdUsers.map(user => ({
                    userId: user.id,
                    score: Math.floor(Math.random() * 10000),
                })),
                skipDuplicates: true,
            });
            console.log(`Batch ${Math.floor(i / BATCH_SIZE) + 1}: ${batchSize} users created`);
        }
    }
    async addNewUsers() {
        try {
            const INITIAL_COUNT = 100000;
            const latestCount = await this.prisma.user.count();
            if (latestCount < INITIAL_COUNT) {
                await this.createRandomUsers(INITIAL_COUNT - latestCount);
            }
            const firstLeaderboard = await this.prisma.leaderboard.findFirst();
            if (!firstLeaderboard) {
                return;
            }
            const daysSinceStart = Math.floor((Date.now() - firstLeaderboard.createdAt.getTime()) / (1000 * 60 * 60 * 24));
            const baseGrowthRate = Math.max(0.01, 0.03 - (daysSinceStart * 0.000133));
            const randomGrowth = Math.random() * baseGrowthRate;
            let newCount = Math.round(latestCount * (1 + randomGrowth));
            console.log(baseGrowthRate, randomGrowth, newCount);
            if (latestCount > 150000) {
                newCount = Math.floor(Math.random() * 50);
            }
            let usersToAdd = newCount - latestCount;
            if (usersToAdd > 0) {
                console.log(`Adding ${usersToAdd} users (Growth rate: ${(randomGrowth * 100).toFixed(2)}%)`);
                await this.createRandomUsers(usersToAdd);
            }
        }
        catch (error) {
            console.error('Error updating user count:', error);
        }
    }
    async updateLeaderboard() {
        try {
            const CHUNK_SIZE = 1000;
            let skip = 0;
            while (true) {
                const leaderboards = await this.prisma.leaderboard.findMany({
                    take: CHUNK_SIZE,
                    skip: skip,
                    select: { id: true }
                });
                if (leaderboards.length === 0)
                    break;
                for (let i = 0; i < leaderboards.length; i += 100) {
                    const chunk = leaderboards.slice(i, i + 100);
                    const updatePromise = this.prisma.leaderboard.updateMany({
                        where: {
                            id: {
                                in: chunk.map(l => l.id)
                            }
                        },
                        data: {
                            score: {
                                increment: Math.floor(Math.random() * 1000)
                            }
                        }
                    });
                    await Promise.all([updatePromise]);
                    console.log(`${i + 1} / ${leaderboards.length} leaderboards updated`);
                }
                skip += CHUNK_SIZE;
            }
        }
        catch (error) {
            console.error('Error updating leaderboard:', error);
        }
    }
};
exports.AppService = AppService;
__decorate([
    (0, schedule_1.Cron)('0 0 * * *'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AppService.prototype, "addNewUsers", null);
__decorate([
    (0, schedule_1.Cron)('* */30 * * *'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AppService.prototype, "updateLeaderboard", null);
exports.AppService = AppService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], AppService);
//# sourceMappingURL=app.service.js.map