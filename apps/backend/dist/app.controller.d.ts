import { AppService } from './app.service';
import { SignInRequestDto, SignInResponseDto, UserResponseDto, UpdateUserPointRequestDto, UpdateUserPointResponseDto, GetLeaderboardResponseDto, SwapPointToTicketRequestDto, SwapPointToTicketResponseDto } from './user.dto';
export declare class AppController {
    private readonly appService;
    constructor(appService: AppService);
    healthCheck(): Promise<string>;
    signIn(signInDto: SignInRequestDto): Promise<SignInResponseDto>;
    getUser(token: string): Promise<UserResponseDto>;
    getLeaderboard(token: string): Promise<GetLeaderboardResponseDto>;
    updateUserPoint(token: string, updateUserPointDto: UpdateUserPointRequestDto): Promise<UpdateUserPointResponseDto>;
    test(): Promise<string>;
    swapPointToTicket(token: string, swapPointToTicketDto: SwapPointToTicketRequestDto): Promise<SwapPointToTicketResponseDto>;
}
