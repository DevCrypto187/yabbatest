import { ConfigService } from '@nestjs/config';
import { SignInRequestDto, SignInResponseDto, UserResponseDto, UpdateUserPointResponseDto, GetLeaderboardResponseDto, SwapPointToTicketResponseDto } from './user.dto';
export declare class AppService {
    private configService;
    private prisma;
    constructor(configService: ConfigService);
    private generateToken;
    private verifyToken;
    signIn(signInDto: SignInRequestDto): Promise<SignInResponseDto>;
    getUser(token: string): Promise<UserResponseDto>;
    updatePoint(token: string, point: number): Promise<UpdateUserPointResponseDto>;
    getLeaderboard(token: string): Promise<GetLeaderboardResponseDto>;
    swapPointToTicket(token: string, ticketCount: number): Promise<SwapPointToTicketResponseDto>;
    private generateRandomUserData;
    private createRandomUsers;
    addNewUsers(): Promise<void>;
    updateLeaderboard(): Promise<void>;
}
