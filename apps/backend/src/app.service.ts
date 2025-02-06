import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import * as jwt from 'jsonwebtoken';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression } from '@nestjs/schedule';
import { uniqueNamesGenerator, adjectives, animals, colors, NumberDictionary } from 'unique-names-generator';
import {
  SignInRequestDto,
  SignInResponseDto,
  UserResponseDto,
  UpdateUserPointResponseDto,
  GetLeaderboardResponseDto,
  SwapPointToTicketResponseDto,
} from './user.dto';

@Injectable()
export class AppService {
  private prisma: PrismaClient;

  constructor(private configService: ConfigService) {
    this.prisma = new PrismaClient();
  }

  private generateToken(userId: number, tgUserId: string) {
    return jwt.sign(
      {
        userId,
        tgUserId,
      },
      this.configService.get<string>('JWT_SECRET') ?? '',
      { expiresIn: '24h' },
    );
  }

  private verifyToken(token: string): { username: string; tgUserId: string } {
    try {
      token = token.replace('Bearer', '').trim();
      
      const decoded = jwt.verify(token, this.configService.get<string>('JWT_SECRET') ?? '') as { username: string; tgUserId: string };
      return decoded;
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }

  async signIn(signInDto: SignInRequestDto): Promise<SignInResponseDto> {
    try {
      const existingUser = await this.prisma.user.findFirst({
        where: { tgUserId: signInDto.tgUserId },
      });

      if (existingUser) {
        const token = this.generateToken(
          existingUser.id,
          existingUser.tgUserId,
        );

        return {
          token,
          success: true,
        };
      }

      // 초대 코드가 유효한지 확인
      let inviteeUserId: number | null = null;
      if (signInDto.inviteCode) {
        const inviter = await this.prisma.user.findUnique({
          where: { inviteCode: signInDto.inviteCode },
        });

        if (inviter) {
          inviteeUserId = inviter.id;
        }
      }

      // 새 유저 생성
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
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  async getUser(token: string): Promise<UserResponseDto> {
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
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  async updatePoint(token: string, point: number): Promise<UpdateUserPointResponseDto> {
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
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  async getLeaderboard(token: string): Promise<GetLeaderboardResponseDto> {
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
          // userProfile: leaderboard.user.userProfile,
          userProfile: `https://api.dicebear.com/9.x/pixel-art/svg?seed=${leaderboard.user.username}`,
          score: leaderboard.score,
        })),
        success: true,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }



  async swapPointToTicket(token: string, ticketCount: number): Promise<SwapPointToTicketResponseDto> {
    try {
      const decoded = this.verifyToken(token);
      const user = await this.prisma.user.findFirst({
        where: { tgUserId: decoded.tgUserId },
      });

      if(!user) {
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

      switch(ticketCount) {
        case 1:
          if(totalPoint > 20) {
            decrementPoint = 20;
          } 
          break;
        case 3:
          if(totalPoint > 50) {
            decrementPoint = 50;
          }
          break;
        case 5:
          if(totalPoint > 100) {
            decrementPoint = 100;
          }
          break;
      }

      if(decrementPoint === 0) {
        return {
          success: false,
          message: 'Not enough point',
        };
      }

      if(decrementPoint > 0) {
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
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  private generateRandomUserData() {
    const randomNum = Math.floor(Math.random() * 100000);
    const numberDictionary = NumberDictionary.generate({ min: 1, max: 99 });
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

    const dictionaries = [adjectives];
    if(Math.random() > 0.7) {
      dictionaries.push(animals);
    }
    if(Math.random() > 0.5) {
      dictionaries.push(colors);
    }
    if(Math.random() > 0.5) {
      dictionaries.push(numberDictionary);
    }
    if(Math.random() > 0.3) {
      dictionaries.push(cryptoDic);
    }

    // Randomly shuffle dictionaries array
    for (let i = dictionaries.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [dictionaries[i], dictionaries[j]] = [dictionaries[j], dictionaries[i]];
    }

    const randomName = uniqueNamesGenerator({
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

  private async createRandomUsers(count: number): Promise<void> {
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

  @Cron('0 0 * * *')
  async addNewUsers() {
    try {
      const INITIAL_COUNT = 100000;
      const latestCount = await this.prisma.user.count();
      
      if (latestCount < INITIAL_COUNT) {
        await this.createRandomUsers(INITIAL_COUNT - latestCount);
      }

      // Get the first leaderboard entry to determine start date
      const firstLeaderboard = await this.prisma.leaderboard.findFirst();
      
      if(!firstLeaderboard) {
        return;
      }

      // Calculate days since start
      const daysSinceStart = Math.floor(
        (Date.now() - firstLeaderboard.createdAt.getTime()) / (1000 * 60 * 60 * 24)
      );

      // Base growth rate decreases over time (5% to 1% over 30 days)
      const baseGrowthRate = Math.max(0.01, 0.03 - (daysSinceStart * 0.000133));
      
      // Random variation between 0% to the base growth rate
      const randomGrowth = Math.random() * baseGrowthRate;
      
      let newCount = Math.round(latestCount * (1 + randomGrowth));
      console.log(baseGrowthRate, randomGrowth, newCount);

      if(latestCount > 150000) {
        newCount = Math.floor(Math.random() * 50);
      }

      let usersToAdd = newCount - latestCount;

      if (usersToAdd > 0) {
        console.log(`Adding ${usersToAdd} users (Growth rate: ${(randomGrowth * 100).toFixed(2)}%)`);
        await this.createRandomUsers(usersToAdd);
      }
    } catch (error) {
      console.error('Error updating user count:', error);
    }
  }

  @Cron('* */30 * * *')
  async updateLeaderboard() {
    try {
      const CHUNK_SIZE = 1000; // Process 1000 records at a time
      let skip = 0;
      
      while (true) {
        // Get chunk of leaderboards
        const leaderboards = await this.prisma.leaderboard.findMany({
          take: CHUNK_SIZE,
          skip: skip,
          select: { id: true }
        });

        if (leaderboards.length === 0) break;

        // Process chunks in parallel
        // const updatePromises: Promise<any>[] = [];
        
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

          // updatePromises.push(updatePromise);
          await Promise.all([updatePromise]);
          console.log(`${i + 1} / ${leaderboards.length} leaderboards updated`);
        }

        // await Promise.all(updatePromises);
        skip += CHUNK_SIZE;
      }
    } catch (error) {
      console.error('Error updating leaderboard:', error);
    }
  }
}
