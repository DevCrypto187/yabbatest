"use client";

import { useTelegramWallet } from "@/hooks/useTelegramWallet";
import { useScreenHeight } from "@/hooks/useScreenHeight";
import { AlertDialog } from "@/components/dialog/alert-dialog";
import Image from "next/image";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import api from "@/lib/api";
import { fetchUserScore } from "@/lib/score";

const REQUIRED_INVITE_COUNT = 5;

export default function TaskPage() {
  const screenHeight = useScreenHeight();
  const { connectWallet } = useTelegramWallet();
  const { token, supabaseUserId } = useAuth();

  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const taskClass = `overflow-x-hidden overflow-y-auto hide-scrollbar pb-[20px] pt-3 ${screenHeight > 644 ? "max-h-[630px]" : "max-h-[520px]"}`;

  // Add new state for tracking clicked items
  const [clickedId, setClickedId] = useState<string | null>(null);

  // Add loading state near other states
  const [isLoading, setIsLoading] = useState(false);

  const checkDailyReward = () => {
    const today = new Date().toISOString().split("T")[0]; // Get today's date in YYYY-MM-DD format
    const lastClaimDate = localStorage.getItem("lastDailyClaimDate");

    if (!lastClaimDate) return true; // Never claimed before
    return lastClaimDate !== today; // Can claim if last claim wasn't today
  };

  const dailyTask = [
    {
      id: 1,
      title: "Daily Reward",
      reward: 100,
      status: checkDailyReward() ? "ready" : "claimed",
      type: "daily",
    },
    {
      id: 2,
      title: "Retweet our post",
      reward: 1000,
      status: localStorage.getItem("retweetClaimed") ? "claimed" : "ready",
      url: "https://x.com/Official_YBDBD/status/1884526129190723752",
      type: "social",
    },
  ];

  const listTask = [
    {
      id: 1,
      title: "Join Our TG Channel",
      reward: 1000,
      status: localStorage.getItem("telegramClaimed") ? "claimed" : "ready",
      url: "https://t.me/ybdbd_official",
      type: "social",
    },
    // {
    //   id: 1,
    //   title: "Follow our twitter",
    //   reward: 1000,
    //   status: localStorage.getItem("followClaimed") ? "claimed" : "ready",
    //   url: "https://x.com/Official_YBDBD",
    //   type: "social",
    // },
    {
      id: 2,
      title: "Wallet connect",
      reward: 1000,
      status: localStorage.getItem("walletClaimed") ? "claimed" : "ready",
      type: "wallet",
    },
    {
      id: 3,
      title: `Invite ${REQUIRED_INVITE_COUNT} Friend`,
      reward: 5000,
      status: localStorage.getItem("inviteClaimed") ? "claimed" : "ready",
      type: "invite",
    },
  ];

  const getButtonText = (status: string) => {
    switch (status) {
      case "ready":
        return "Check";
      case "claimed":
        return "Claimed";
      default:
        return "Check";
    }
  };

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

  const updatePoints = async (reward: number) => {
    if (!token) return;

    try {
      // Update backend
      await api.put(
        "/point",
        { point: reward },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Fetch updated score using the reusable function
      const score = await fetchUserScore(supabaseUserId);
      updateAuthData(score);
    } catch (error) {
      console.error("Failed to update points:", error);
      throw error;
    }
  };

  const handleTaskClick = async (
    reward: number,
    status: string,
    type: string,
    taskId: string,
    url?: string
  ) => {
    if (status === "claimed") return;

    setClickedId(taskId);

    // Always reset animation after 300ms regardless of API status
    setTimeout(() => setClickedId(null), 300);

    const delay = (ms: number) =>
      new Promise((resolve) => setTimeout(resolve, ms));
    await delay(150); // Initial delay for animation

    try {
      setIsLoading(true);

      if (type === "invite") {
        const response = await api.get("/user", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.data.invitedUserCount >= REQUIRED_INVITE_COUNT) {
          localStorage.setItem("inviteClaimed", "true");
          await updatePoints(reward);
          setAlertMessage(`You've get reward of ${reward} meats!`);
        } else {
          const remainingInvites =
            REQUIRED_INVITE_COUNT - response.data.invitedUserCount;
          setAlertMessage(
            `Invite ${remainingInvites} more friend${remainingInvites > 1 ? "s" : ""} to claim this reward!`
          );
        }
        setShowAlert(true);
      } else if (type === "social" && url) {
        window.open(url, "_blank");
        let storageKey = "followClaimed"; // default
        if (url.includes("status")) {
          storageKey = "retweetClaimed";
        } else if (url.includes("t.me")) {
          storageKey = "telegramClaimed";
        }
        localStorage.setItem(storageKey, "true");
        await updatePoints(reward);
        setAlertMessage(`You've get reward of ${reward} meats!`);
        setShowAlert(true);
      } else if (type === "wallet") {
        const result = await connectWallet();
        if (result) {
          localStorage.setItem("walletClaimed", "true");
          await updatePoints(reward);
          setAlertMessage(`You've get reward of ${reward} meats!`);
        } else {
          setAlertMessage("Failed to connect wallet. Please try again.");
        }
        setShowAlert(true);
      } else if (type === "daily") {
        if (checkDailyReward()) {
          const today = new Date().toISOString().split("T")[0];
          localStorage.setItem("lastDailyClaimDate", today);
          await updatePoints(reward);
          setAlertMessage(`You've get reward of ${reward} meats!`);
          setShowAlert(true);
        }
      }
    } catch (err) {
      console.log(err);
      setAlertMessage("Failed to update points. Please try again.");
      setShowAlert(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAlertClose = () => {
    setShowAlert(false);
  };

  return (
    <>
      <main
        className="min-h-screen w-full animate-fade-in bg-cover bg-center bg-no-repeat relative pb-16 overflow-x-hidden"
        style={{ backgroundImage: 'url("/images/bg-main.webp")' }}
      >
        <div className={taskClass}>
          <h1
            className={`${screenHeight > 644 ? "text-[46px]" : "text-[26px]"} -rotate-1 mt-2 font-lilita text-gradient-yb text-center mb-3`}
          >
            Daily Task
          </h1>

          {dailyTask.map((task) => (
            <div
              key={task.id}
              className={`relative flex mt-1 mb-3 ${
                task.status === "claimed"
                  ? ""
                  : "cursor-pointer transition-transform duration-150"
              } ${clickedId === `daily-${task.id}` ? "scale-95" : ""}`}
              onClick={() =>
                handleTaskClick(
                  task.reward,
                  task.status,
                  task.type,
                  `daily-${task.id}`,
                  task.url
                )
              }
            >
              <Image
                src={
                  task.status === "claimed"
                    ? "/images/vector/task/daily-claimed.png"
                    : "/images/vector/task/daily-bg.png"
                }
                alt="Balance background"
                width={355}
                height={355}
                priority
                unoptimized
              />

              <div className="absolute inset-0 flex flex-col">
                <div className="flex items-center justify-between">
                  <span className="font-lilita mt-4 ml-5 -rotate-2 text-white text-shadow-yb text-[23px]">
                    {task.title}
                  </span>
                  <span className="font-lilita -mt-5 text-white mr-10 text-shadow-yb text-md">
                    +{task.reward}
                  </span>
                </div>

                <div className="flex items-center justify-between mx-auto px-0 mt-auto pb-1">
                  <span className="font-lilita text-white mr-8 text-shadow-yb text-sm uppercase">
                    {getButtonText(task.status)}
                  </span>
                </div>
              </div>
            </div>
          ))}

          <h1
            className={`${screenHeight > 644 ? "text-[46px]" : "text-[26px]"} -rotate-1 mt-10 font-lilita text-gradient-yb-green text-center mb-3`}
          >
            Task List
          </h1>

          {listTask.map((task) => (
            <div
              key={task.id}
              className={`relative flex mt-1 mb-3 ${
                task.status === "claimed"
                  ? ""
                  : "cursor-pointer transition-transform duration-150"
              } ${clickedId === `list-${task.id}` ? "scale-95" : ""}`}
              onClick={() =>
                handleTaskClick(
                  task.reward,
                  task.status,
                  task.type,
                  `list-${task.id}`,
                  task.url
                )
              }
            >
              <Image
                src={
                  task.status === "claimed"
                    ? "/images/vector/task/task-claimed.png"
                    : "/images/vector/task/task-bg.png"
                }
                alt="Balance background"
                width={355}
                height={355}
                priority
                unoptimized
              />

              <div className="absolute inset-0 flex flex-col">
                <div className="flex items-center justify-between">
                  <span className="font-lilita mt-4 ml-5 -rotate-2 text-white text-shadow-yb text-[23px]">
                    {task.title}
                  </span>
                  <span className="font-lilita -mt-5 text-white mr-10 text-shadow-yb text-md">
                    +{task.reward}
                  </span>
                </div>

                <div className="flex items-center justify-between mx-auto px-0 mt-auto pb-1">
                  <span className="font-lilita text-white mr-8 text-shadow-yb text-sm uppercase">
                    {getButtonText(task.status)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      {isLoading && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
        </div>
      )}

      <AlertDialog
        isOpen={showAlert}
        onClose={handleAlertClose}
        onConfirm={handleAlertClose}
        message={alertMessage}
        showConfirm={false}
      />
    </>
  );
}
