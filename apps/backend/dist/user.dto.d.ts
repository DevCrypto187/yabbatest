export declare class SignInRequestDto {
    username: string;
    tgUserId: string;
    inviteCode?: string;
}
export declare class SignInResponseDto {
    token?: string;
    success: boolean;
    message?: string;
}
export declare class UserResponseDto {
    username?: string;
    inviteCode?: string;
    point?: number;
    ticketCount?: number;
    invitedUserCount?: number;
    success: boolean;
    message?: string;
}
export declare class UpdateUserPointRequestDto {
    point: number;
}
export declare class UpdateUserPointResponseDto {
    success: boolean;
    message?: string;
}
export declare class GetLeaderboardResponseDto {
    totalUserCount?: number;
    list?: Array<{
        username: string;
        userProfile: string;
        score: number;
    }>;
    success: boolean;
    message?: string;
}
export declare class SwapPointToTicketRequestDto {
    ticketCount: number;
}
export declare class SwapPointToTicketResponseDto {
    success: boolean;
    message?: string;
}
