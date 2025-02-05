import { Body, Controller, Get, Post, Put, Headers } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AppService } from './app.service';
import {
  SignInRequestDto,
  SignInResponseDto,
  UserResponseDto,
  UpdateUserPointRequestDto,
  UpdateUserPointResponseDto,
  GetLeaderboardResponseDto,
  SwapPointToTicketRequestDto,
  SwapPointToTicketResponseDto,
} from './user.dto';

@ApiTags('YBDBD TMA')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('/')
  async healthCheck() {
    return 'OK';
  }

  @Post('/auth/signin')
  @ApiOperation({ summary: 'Sign in with Telegram' })
  @ApiResponse({ status: 200, description: 'Success', type: SignInResponseDto })
  async signIn(
    @Body() signInDto: SignInRequestDto,
  ): Promise<SignInResponseDto> {
    return await this.appService.signIn(signInDto);
  }

  @Get('/user')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get user information' })
  @ApiResponse({ status: 200, description: 'Success', type: UserResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getUser(
    @Headers('authorization') token: string
  ): Promise<UserResponseDto> {
    return this.appService.getUser(token);
  }

  @Get('/leaderboard')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get leaderboard' })
  @ApiResponse({ status: 200, description: 'Success', type: GetLeaderboardResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getLeaderboard(
    @Headers('authorization') token: string
  ): Promise<GetLeaderboardResponseDto> {
    return this.appService.getLeaderboard(token);
  }

  @Put('/point')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update user points' })
  @ApiResponse({ status: 200, description: 'Success', type: UpdateUserPointResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async updateUserPoint(
    @Headers('authorization') token: string,
    @Body() updateUserPointDto: UpdateUserPointRequestDto,
  ): Promise<UpdateUserPointResponseDto> {
    return this.appService.updatePoint(token, updateUserPointDto.point);
  }

  @Get('/test')
  async test() {
    await this.appService.addNewUsers();
    await this.appService.updateLeaderboard();

    return 'success';
  }

  @Post('/swap-point-to-ticket')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Swap point to ticket' })
  @ApiResponse({ status: 200, description: 'Success', type: SwapPointToTicketResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async swapPointToTicket(
    @Headers('authorization') token: string,
    @Body() swapPointToTicketDto: SwapPointToTicketRequestDto,
  ): Promise<SwapPointToTicketResponseDto> {
    return this.appService.swapPointToTicket(token, swapPointToTicketDto.ticketCount);
  }
}
