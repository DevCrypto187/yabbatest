"use client";

import { useEffect, useState, useRef } from "react";
import { useTelegram } from "./useTelegram";
import api from "@/lib/api";
import { supabase } from "@/lib/api";

interface AuthData {
  token: string;
  username: string;
  tgUserId: string;
  inviteCode: string;
  userScore: number;
  supabaseUserId: string;
}

export const useAuth = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [authData, setAuthData] = useState<AuthData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const telegram = useTelegram();
  const initialized = useRef(false);

  const fetchUserData = async (token: string) => {
    try {
      const response = await api.get("/user", {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data.inviteCode;
    } catch (error) {
      console.error("Failed to fetch user data:", error);
      return null;
    }
  };

  const checkInviteCode = async (code: string, currentUserTgId: string) => {
    try {
      // First get the inviter's user ID and tgUserId
      const { data: inviter, error: userError } = await supabase
        .from("User")
        .select("id, tgUserId")
        .eq("inviteCode", code)
        .single();

      if (userError) {
        console.error("Invalid invite code:", userError);
        return false;
      }

      // Prevent self-invitation
      if (inviter.tgUserId === currentUserTgId) {
        console.error("Cannot use own invite code");
        return false;
      }

      // Check if inviter has a leaderboard entry
      const { data: leaderboard, error: leaderboardError } = await supabase
        .from("Leaderboard")
        .select("*")
        .eq("userId", inviter.id)
        .single();

      if (leaderboardError) {
        // Create new leaderboard entry if it doesn't exist
        const { error: createError } = await supabase
          .from("Leaderboard")
          .insert([{ userId: inviter.id, score: 2000 }]);

        if (createError) {
          console.error("Error creating leaderboard entry:", createError);
          return false;
        }
      } else {
        // Update existing leaderboard entry
        const { error: updateError } = await supabase
          .from("Leaderboard")
          .update({ score: leaderboard.score + 2000 })
          .eq("userId", inviter.id);

        if (updateError) {
          console.error("Error updating score:", updateError);
          return false;
        }
      }

      return true;
    } catch (error) {
      console.error("Error checking invite code:", error);
      return false;
    }
  };

  const validateUser = async (tgUserId: string) => {
    try {
      const { data: user, error } = await supabase
        .from("User")
        .select("id")
        .eq("tgUserId", tgUserId)
        .single();

      if (error || !user) {
        // User doesn't exist, clear localStorage
        localStorage.removeItem("authData");
        localStorage.removeItem("hasSeenWelcome");
        setAuthData(null);
        return false;
      }

      return true;
    } catch (error) {
      console.error("Error validating user:", error);
      return false;
    }
  };

  useEffect(() => {
    const signIn = async () => {
      const user = telegram?.telegram?.initDataUnsafe?.user;
      if (!user?.username || !user?.id) {
        console.log("No telegram user data yet:", user);
        return;
      }

      try {
        // Get invite code from startParam
        const inviteCode = telegram.startParam || "";

        // Check if invite code exists and is not user's own code
        if (inviteCode) {
          const isValidInvite = await checkInviteCode(
            inviteCode,
            user.id.toString()
          );
          console.log("Is valid invite:", isValidInvite);
        }

        const requestData = {
          username: user.username.toString(),
          tgUserId: user.id.toString(),
          inviteCode,
        };

        // Continue with existing auth flow
        const response = await api.post("/auth/signin", requestData);

        if (response.data.success && response.data.token) {
          const { data: userData, error: supabaseError } = await supabase
            .from("User")
            .select("*")
            .eq("tgUserId", user.id.toString())
            .single();

          if (supabaseError) {
            console.error("Supabase Error:", supabaseError);
          }

          const inviteCode = await fetchUserData(response.data.token);
          const newAuthData: AuthData = {
            token: response.data.token,
            username: requestData.username,
            tgUserId: requestData.tgUserId,
            inviteCode: inviteCode || "",
            userScore: userData?.score || 0,
            supabaseUserId: userData?.id || "",
          };
          localStorage.setItem("authData", JSON.stringify(newAuthData));
          setAuthData(newAuthData);
        }
      } catch (error) {
        console.error("Auth error:", error);
        setError(JSON.stringify(error, null, 2));
      }
    };

    if (initialized.current) return;

    const storedAuthData = localStorage.getItem("authData");
    if (storedAuthData) {
      const parsedAuthData = JSON.parse(storedAuthData);

      // Validate user exists before using stored auth data
      validateUser(parsedAuthData.tgUserId).then((isValid) => {
        if (isValid) {
          setAuthData(parsedAuthData);
        }
        setIsLoading(false);
        initialized.current = true;
      });
    } else if (telegram) {
      signIn().finally(() => {
        setIsLoading(false);
        initialized.current = true;
      });
    } else {
      setIsLoading(false);
    }
  }, [telegram]);

  return {
    isLoading,
    token: authData?.token || null,
    username: authData?.username || null,
    tgUserId: authData?.tgUserId || null,
    inviteCode: authData?.inviteCode || null,
    supabaseUserId: authData?.supabaseUserId || null,
    telegram,
    error,
  };
};
