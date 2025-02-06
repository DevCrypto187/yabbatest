import { ApiProperty } from '@nestjs/swagger';

export class SignInRequestDto {
  @ApiProperty({ description: 'Telegram username' })
  username: string;

  @ApiProperty({ description: 'Telegram user ID' })
  tgUserId: string;

  @ApiProperty({ description: 'Invitation code (optional)', required: false })
  inviteCode?: string;
}

export class SignInResponseDto {
  @ApiProperty({ description: 'JWT token', required: false })
  token?: string;

  @ApiProperty({ description: 'Success status' })
  success: boolean;

  @ApiProperty({ description: 'Error message (if any)', required: false })
  message?: string;
}

export class UserResponseDto {
  @ApiProperty({ description: 'Username', required: false })
  username?: string;

  @ApiProperty({ description: 'Invitation code', required: false })
  inviteCode?: string;

  @ApiProperty({ description: 'Point', required: false })
  point?: number;

  @ApiProperty({ description: 'Ticket count', required: false })
  ticketCount?: number;

  @ApiProperty({ description: 'Invited user count', required: false })
  invitedUserCount?: number;

  @ApiProperty({ description: 'Success status' })
  success: boolean;

  @ApiProperty({ description: 'Error message (if any)', required: false })
  message?: string;
}

export class UpdateUserPointRequestDto {
  @ApiProperty({ description: 'Points to add/subtract' })
  point: number;
}

export class UpdateUserPointResponseDto {
  @ApiProperty({ description: 'Success status' })
  success: boolean;

  @ApiProperty({ description: 'Error message (if any)', required: false })
  message?: string;
}

export class GetLeaderboardResponseDto {
  @ApiProperty({ description: 'Total user count', required: false })
  totalUserCount?: number;

  @ApiProperty({
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
  })
  list?: Array<{
    username: string;
    userProfile: string;
    score: number;
  }>;

  @ApiProperty({ description: 'Success status' })
  success: boolean;

  @ApiProperty({ description: 'Error message (if any)', required: false })
  message?: string;
}

export class SwapPointToTicketRequestDto {
  @ApiProperty({ description: 'Ticket count' })
  ticketCount: number;
}

export class SwapPointToTicketResponseDto {
  @ApiProperty({ description: 'Success status' })
  success: boolean;

  @ApiProperty({ description: 'Error message (if any)', required: false })
  message?: string;
}