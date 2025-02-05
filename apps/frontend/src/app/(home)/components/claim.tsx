"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useScreenHeight } from "@/hooks/useScreenHeight";
import { useAuth } from "@/hooks/useAuth";
import api from "@/lib/api";
import { fetchUserScore } from "@/lib/score";

export function Claim() {
  const { token, supabaseUserId } = useAuth();
  const screenHeight = useScreenHeight();

  // Define constants
  const FARMING_REWARD = 100;
  const TIMER_DURATION = 10; // seconds
  const ANIMATION_DURATION = 1000; // milliseconds

  const [isClaiming, setIsClaiming] = useState(false);
  const [timer, setTimer] = useState(0);
  const [farmingAmount, setFarmingAmount] = useState(0);

  const updateAuthData = (newScore: number) => {
    const storedAuthData = localStorage.getItem("authData");
    if (storedAuthData) {
      const authData = JSON.parse(storedAuthData);
      const updatedAuthData = {
        ...authData,
        userScore: newScore,
      };
      localStorage.setItem("authData", JSON.stringify(updatedAuthData));
    }
  };

  useEffect(() => {
    const updateScore = async () => {
      if (!supabaseUserId) return;

      const score = await fetchUserScore(supabaseUserId);
      setFarmingAmount(score);
      updateAuthData(score);
    };

    updateScore();
  }, [supabaseUserId]);

  useEffect(() => {
    const checkFarmingSession = async () => {
      // Return early if no auth data yet
      if (!supabaseUserId || !token) {
        console.log("Waiting for auth data...");
        return;
      }

      const farmingSession = localStorage.getItem("farmingSession");
      if (farmingSession) {
        const { startTime, endTime } = JSON.parse(farmingSession);
        const now = Date.now();

        console.log("Checking farming session:", { startTime, endTime, now });

        if (now < endTime) {
          console.log("Farming in progress, resuming timer");
          setIsClaiming(true);
          setTimer(Math.ceil((endTime - now) / 1000));
        } else {
          console.log("Farming completed while away, awarding points");
          localStorage.removeItem("farmingSession");

          try {
            // Update backend
            await api.put(
              "/point",
              { point: FARMING_REWARD },
              { headers: { Authorization: `Bearer ${token}` } }
            );

            // Update local state and storage
            setFarmingAmount((prev) => {
              const newTotal = prev + FARMING_REWARD;
              // console.log("New total:", newTotal);
              updateAuthData(newTotal);
              return newTotal;
            });

            // console.log("Points awarded successfully:", FARMING_REWARD);
          } catch (error) {
            console.error("Failed to update points:", error);
          }
        }
      }
    };

    checkFarmingSession();
  }, [supabaseUserId, token]);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isClaiming && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (timer === 0 && isClaiming) {
      setFarmingAmount((prev) => prev + FARMING_REWARD);

      // Send points to API
      if (token) {
        api
          .put(
            "/point",
            { point: FARMING_REWARD },
            { headers: { Authorization: `Bearer ${token}` } }
          )
          .catch((error) => {
            console.error("Failed to update points:", error);
          });
      }

      setTimeout(() => {
        setIsClaiming(false);
      }, ANIMATION_DURATION);
    }

    return () => clearInterval(interval);
  }, [timer, isClaiming, token]);

  // When farming completes successfully
  useEffect(() => {
    if (timer === 0 && isClaiming) {
      localStorage.removeItem("farmingSession");
    }
  }, [timer, isClaiming]);

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleClaim = () => {
    if (!isClaiming) {
      const startTime = Date.now();
      const endTime = startTime + TIMER_DURATION * 1000;

      localStorage.setItem(
        "farmingSession",
        JSON.stringify({
          startTime,
          endTime,
        })
      );

      setIsClaiming(true);
      setTimer(TIMER_DURATION);
    }
  };

  const logoClass = `mx-auto z-10 md:w-[280px] ${screenHeight > 644 ? "w-[60%]" : "w-[40%]"}`;
  const socialClass = `h-auto md:w-[220px] md:-mt-[40px] mx-auto ${screenHeight > 644 ? "w-[75%] -mt-[49px]" : "w-[65%] -mt-[40px]"}`;
  const balanceClass = `h-auto ${screenHeight > 644 ? "w-[45%]" : "w-[35%]"}`;
  const balanceClassText = `font-lilita text-white absolute text-shadow-yb ${
    screenHeight > 644 ? "text-[18px] -mt-3" : "text-[15px] -mt-2"
  } ${timer === 0 && isClaiming ? "animate-ping-slow" : ""}`;

  // Add function to calculate progress width
  const calculateProgressWidth = () => {
    if (!isClaiming) return 50;
    const maxWidth = 285;
    const minWidth = 50;
    const totalTime = 10; // total seconds
    const remainingProgress = (totalTime - timer) / totalTime;
    return Math.round(minWidth + (maxWidth - minWidth) * remainingProgress);
  };

  // Format balance to 6 digits with leading zeros
  const formatBalance = (num: number) => {
    return num.toString().padStart(6, "0");
  };

  return (
    <div className="relative z-10 flex flex-col items-center justify-between pt-4 mx-auto">
      {/* Logo */}
      <div className="w-full flex flex-col justify-center">
        <Image
          src="/images/logo2xl-alt.webp"
          alt="YBDBD Logo"
          width={50}
          height={50}
          unoptimized
          priority={true}
          loading="eager"
          className={logoClass}
        />
        <Link
          href="https://x.com/official_ybdbd"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            src="/images/vector/x-task.png"
            alt="YBDBD Logo"
            width={200}
            height={200}
            unoptimized
            className={socialClass}
          />
        </Link>
      </div>

      <div className="relative flex items-center justify-center mt-1">
        <Image
          src="/images/vector/balance.png"
          alt="Balance background"
          width={120}
          height={120}
          unoptimized
          className={balanceClass}
        />
        <p className={balanceClassText}>{formatBalance(farmingAmount)}</p>
      </div>

      {/* Farming section */}
      <div className="w-full max-w-[320px] mx-auto mt-4 z-10">
        <div className="relative p-3">
          <Image
            src="/images/vector/bg-farming.png"
            alt="Farming background"
            width={266}
            height={45}
            unoptimized
            className="absolute inset-0 w-full h-[44px] pr-9 ml-8"
          />
          {/* Star background */}
          <Image
            src="/images/vector/star-bg.png"
            alt="Star background"
            width={64}
            height={64}
            unoptimized
            className="absolute left-2 top-5 -translate-y-1/2 w-[64px] h-auto z-10"
          />

          {/* Meat assets */}
          <Image
            src={`/images/vector/${isClaiming ? "meat-red" : "meat"}.png`}
            alt="Star background"
            width={31}
            height={31}
            unoptimized
            className="absolute left-6 top-5 -translate-y-1/2 z-10"
          />

          <Image
            src={`/images/vector/${isClaiming ? "bg-farming-red" : "bg-farming-grey"}.png`}
            alt="Farming background"
            width={calculateProgressWidth()}
            height={45}
            unoptimized
            className="h-[44px] absolute inset-0 ml-8"
          />

          {/* Username text */}
          <p
            className={`text-white absolute font-lilita text-shadow-yb z-20 pl-[65px] text-[15px] ${isClaiming ? "animate-pulse" : ""}`}
          >
            Farming {FARMING_REWARD} Meats
          </p>

          {/* Timer */}
          <div className="absolute right-2 bottom-3 -translate-y-1/2">
            <p className="text-white font-lilita text-shadow-yb">
              {formatTime(timer)}
            </p>
          </div>
        </div>

        <div className="relative flex items-center justify-between">
          <Link
            href="/balance"
            prefetch={true}
            className="transition-opacity duration-200 hover:opacity-90"
          >
            <Image
              src={"/images/vector/ticket-swap.png"}
              alt="swap ticket"
              width={120}
              height={120}
              unoptimized
              className="w-full -mt-[6px]"
            />
          </Link>
          <button
            onClick={handleClaim}
            disabled={isClaiming}
            className="-ml-4 z-40 relative"
          >
            <Image
              src={`/images/vector/${isClaiming ? "claim-disable" : "claim-enable"}.png`}
              alt="Claim button"
              width={70}
              height={70}
              unoptimized
              className="w-full mt-4"
            />
          </button>
        </div>
      </div>

      <Link
        href="/games/stone-age-defenders"
        className="transition-opacity duration-200 hover:opacity-90"
      >
        <Image
          src="/images/vector/btn-play.webp"
          alt="Star background"
          width={50}
          height={50}
          priority={true}
          loading="eager"
          unoptimized
          className="transform-gpu w-[77%] mx-auto"
        />
      </Link>
    </div>
  );
}
