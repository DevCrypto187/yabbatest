"use client";

import { useTelegram } from "@/hooks/useTelegram";
import { useScreenHeight } from "@/hooks/useScreenHeight";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";
import Image from "next/image";
import api from "@/lib/api";
import { fetchUserScore } from "@/lib/score";

interface LeaderboardEntry {
  username: string;
  userProfile: string;
  score: number;
}

export default function RankPage() {
  const screenHeight = useScreenHeight();
  const { telegram } = useTelegram();
  const { token, supabaseUserId } = useAuth();
  const user = telegram?.initDataUnsafe?.user;
  const [userScore, setUserScore] = useState(0);
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>(
    []
  );
  const [totalUsers, setTotalUsers] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const lbdClass = `px-6 overflow-y-auto hide-scrollbar -mt-3 pb-[20px] ${screenHeight > 644 ? "max-h-[380px]" : "max-h-[280px]"}`;

  useEffect(() => {
    const fetchLeaderboard = async () => {
      if (!token) return;
      setIsLoading(true);
      try {
        const response = await api.get("/leaderboard", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setLeaderboardData(response.data.list.slice(0, 100));
        setTotalUsers(response.data.totalUserCount);
      } catch (error) {
        console.error("Failed to fetch leaderboard:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLeaderboard();
  }, [token]);

  useEffect(() => {
    const updateUserScore = async () => {
      if (!supabaseUserId) return;

      const score = await fetchUserScore(supabaseUserId);
      setUserScore(score);
    };

    updateUserScore();
  }, [supabaseUserId]);

  // Function to render avatar content
  const renderAvatar = (photoUrl?: string) => {
    if (photoUrl) {
      return (
        <Image
          src={photoUrl}
          alt="User avatar"
          width={60}
          height={60}
          unoptimized
          className="absolute inset-3 rounded-full w-[60px] h-[60px] mx-auto object-cover"
          onError={(e) => {
            // Fallback to placeholder if image fails to load
            e.currentTarget.style.display = "none";
            const placeholder = e.currentTarget.parentElement?.querySelector(
              ".placeholder"
            ) as HTMLElement;
            if (placeholder) placeholder.style.display = "block";
          }}
        />
      );
    }
    return (
      <div className="absolute inset-3 rounded-full bg-gray-300 w-[60px] h-[60px] mx-auto placeholder" />
    );
  };

  const formatNumberToK = (num: number) => {
    return num >= 1000 ? `${(num / 1000).toFixed(1)}k` : num.toString();
  };

  const SkeletonLoader = () => (
    <>
      {[...Array(5)].map((_, index) => (
        <div
          key={index}
          className="mt-4 bg-black/50 h-[52px] flex items-center p-2 relative mb-10 w-full animate-pulse"
        >
          <div className="relative -ml-6 w-[90px] h-[90px]">
            <div className="absolute inset-3 rounded-full bg-red-200 w-[60px] h-[60px] mx-auto" />
          </div>
          <div className="flex-1 flex gap-7 items-center px-3">
            <div className="h-4 bg-red-200 rounded w-[150px]" />
            <div className="flex items-center gap-2 flex-1">
              <div className="flex flex-col gap-2">
                <div className="w-3 h-3 bg-red-200 rounded" />
                <div className="w-3 h-3 bg-red-200 rounded" />
              </div>
              <div className="flex ml-auto">
                <div className="h-6 bg-red-200 rounded w-6" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </>
  );

  return (
    <main
      className="min-h-screen w-full animate-fade-in bg-cover bg-center bg-no-repeat relative pb-16"
      style={{ backgroundImage: 'url("/images/bg-main.webp")' }}
    >
      <div className="relative z-10 p-6">
        <h1
          className={`${screenHeight > 644 ? "text-[38px]" : "text-[26px]"} -rotate-1 mt-2 font-lilita text-gradient-yb text-center`}
        >
          Leaderboard
        </h1>

        {/* User's Card */}
        <div className="mt-4 bg-[#11D82F]/80 h-[52px] flex items-center p-2 relative">
          <div className="relative -ml-6 w-[90px] h-[90px]">
            <Image
              src="/images/vector/rank/ava-canvas.png"
              alt="Avatar frame"
              fill
              className="object-contain"
            />
            {renderAvatar(user?.photo_url)}
          </div>

          {/* Nickname and Score Container */}
          <div className="flex-1 flex  gap-7 items-center px-3 ">
            <span className="text-[14px] text-black font-lilita max-w-[200px]">
              @{user?.username}
            </span>
            <div className="flex items-center gap-2 flex-1">
              <div className="flex flex-col">
                <Image
                  src="/images/vector/meat-red.png"
                  alt="Meat score"
                  width={40}
                  height={40}
                  className="-mt-2"
                />
                <span className="text-black text-sm mt-2 ml-1 font-lilita">
                  {formatNumberToK(userScore)}
                </span>
              </div>
              <div className="flex ml-auto">
                <span className="text-black text-xl font-lilita">712</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-3 flex justify-center">
          <h1
            className={`${screenHeight > 644 ? "text-[38px]" : "text-[26px]"} -rotate-1 mt-2 font-lilita text-gradient-yb-red text-center`}
          >
            {formatNumberToK(totalUsers)} Holders
          </h1>
        </div>
      </div>

      {/* Add the vector background container */}
      <Image
        src="/images/vector/rank/abstract.png"
        alt="Background vector"
        fill
        className="absolute -mt-16 right-0 w-full h-full object-contain z-0"
      />
      <div className="relative">
        <div className={`${lbdClass} relative z-10`}>
          {isLoading ? (
            <SkeletonLoader />
          ) : (
            leaderboardData.map((player, index) => (
              <div
                key={index}
                className="mt-4 bg-black/50 h-[52px] flex items-center p-2 relative mb-10 w-full"
              >
                <div className="relative -ml-6 w-[90px] h-[90px]">
                  <Image
                    src="/images/vector/rank/ava-canvas.png"
                    alt="Avatar frame"
                    fill
                    className="object-contain"
                  />
                  {renderAvatar(player.userProfile)}
                </div>

                {/* Nickname and Score Container */}
                <div className="flex-1 flex gap-7 items-center px-3">
                  <span className="text-[14px] text-white w-[150px] font-lilita truncate">
                    @{player.username}
                  </span>
                  <div className="flex items-center gap-2 flex-1">
                    <div className="flex flex-col">
                      <Image
                        src="/images/vector/meat-red.png"
                        alt="Meat score"
                        width={40}
                        height={40}
                        className="-mt-2 object-cover"
                      />
                      <span className="text-[white] text-sm mt-2 ml-1 font-lilita">
                        {formatNumberToK(player.score)}
                      </span>
                    </div>
                    <div className="flex ml-auto">
                      <span className="text-[#ED9D6B] text-xl font-lilita">
                        {String(index + 1).padStart(3, "0")}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </main>
  );
}
