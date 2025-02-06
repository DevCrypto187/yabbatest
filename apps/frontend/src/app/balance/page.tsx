"use client";

import Image from "next/image";
import { useScreenHeight } from "@/hooks/useScreenHeight";
import { AlertDialog } from "@/components/dialog/alert-dialog";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import api from "@/lib/api";

const TICKET_EXCHANGE_OPTIONS = [
  {
    meatsRequired: 20,
    ticketsReceived: 1,
  },
  {
    meatsRequired: 23,
    ticketsReceived: 3,
  },
  {
    meatsRequired: 25,
    ticketsReceived: 5,
  },
  // {
  //   meatsRequired: 100,
  //   ticketsReceived: 18,
  // },
  // {
  //   meatsRequired: 120,
  //   ticketsReceived: 22,
  // },
  // {
  //   meatsRequired: 150,
  //   ticketsReceived: 28,
  // },
  // {
  //   meatsRequired: 180,
  //   ticketsReceived: 35,
  // },
] as const;

const SkeletonCard = () => (
  <div className="relative flex items-center justify-center mt-1 mb-2 animate-pulse">
    <Image
      src="/images/vector/balance/bg-ticket-list.png"
      alt="Balance background"
      width={317}
      height={317}
      priority
      unoptimized
    />
    <div className="absolute inset-0 flex flex-col">
      <div className="flex items-center pt-4">
        <div className="h-4 bg-gray-200/20 rounded w-48 ml-auto pr-4" />
      </div>

      <div className="flex items-center justify-between px-0 mt-auto pb-1">
        <span className="font-lilita ml-10 text-white text-shadow-yb text-sm opacity-20">
          SWAP
        </span>
        <div className="h-3 bg-gray-200/20 rounded w-8 mr-5" />
      </div>
    </div>
  </div>
);

export default function BalancePage() {
  const screenHeight = useScreenHeight();
  const { token } = useAuth();
  const [tickets, setTickets] = useState(0);
  const [meats, setMeats] = useState(0);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState<
    (typeof TICKET_EXCHANGE_OPTIONS)[number] | null
  >(null);
  const [isError, setIsError] = useState(false);
  const [ticketsHighlight, setTicketsHighlight] = useState(false);
  const [meatsHighlight, setMeatsHighlight] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSwapping, setIsSwapping] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");

  const cardClass = `overflow-y-auto hide-scrollbar pb-[20px] w-[317px] mx-auto ${screenHeight > 644 ? "max-h-[360px]" : "max-h-[220px]"}`;

  useEffect(() => {
    const fetchBalance = async () => {
      setIsLoading(true);
      try {
        const response = await api.get("/user", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.data.success) {
          setMeats(response.data.point);
          setTickets(response.data.ticketCount);
        }
      } catch (error) {
        console.error("Error fetching balance:", error);
      } finally {
        setTimeout(() => {
          setIsLoading(false);
        }, 100);
      }
    };

    if (token) {
      fetchBalance();
    }
  }, [token]);

  const handleSwapConfirm = async () => {
    if (selectedOption && !isError) {
      setIsAlertOpen(false);
      setIsSwapping(true);

      try {
        const response = await api.post(
          "/swap-point-to-ticket",
          { ticketCount: selectedOption.ticketsReceived },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (response.data.success) {
          setTickets((prev) => prev + selectedOption.ticketsReceived);
          setMeats((prev) => prev - selectedOption.meatsRequired);
          setTicketsHighlight(true);
          setMeatsHighlight(true);
          setTimeout(() => {
            setTicketsHighlight(false);
            setMeatsHighlight(false);
          }, 700);
        } else {
          setIsError(true);
          setIsAlertOpen(true);
          setAlertMessage(
            response.data.message || "Failed to swap. Please try again."
          );
        }
      } catch (error) {
        console.error("Error swapping:", error);
        setIsError(true);
        setIsAlertOpen(true);
        setAlertMessage("Failed to swap. Please try again.");
      } finally {
        setIsSwapping(false);
      }
    } else {
      setIsAlertOpen(false);
    }
  };

  const handleCardClick = (
    option: (typeof TICKET_EXCHANGE_OPTIONS)[number]
  ) => {
    if (meats < option.meatsRequired) {
      setIsError(true);
      setSelectedOption(option);
      setIsAlertOpen(true);
      return;
    }
    setIsError(false);
    setSelectedOption(option);
    setIsAlertOpen(true);
  };

  return (
    <main
      className="min-h-screen w-full animate-fade-in bg-cover bg-center bg-no-repeat relative pb-16"
      style={{ backgroundImage: 'url("/images/bg-main.webp")' }}
    >
      <div className="relative z-10 p-6 bg-[#80CD05]/85 h-[190px]">
        <Image
          src="/images/logo2xl.webp"
          alt="YBDBD Logo"
          width={200}
          height={200}
          priority
          unoptimized
          className="mx-auto"
        />

        <div className="flex flex-row justify-center gap-3 mt-5">
          <div className="relative flex items-center justify-center mt-1">
            <Image
              src="/images/vector/balance/bg-total-ticket.png"
              alt="Balance background"
              width={120}
              height={120}
              priority
              unoptimized
              className="w-full h-auto"
            />
            <p className="w-full text-[17px] absolute font-lilita text-white text-shadow-yb ml-auto pr-3 -mt-8 text-right">
              Tickets
            </p>
            <p
              className={`w-full text-[15px] absolute font-lilita text-white text-shadow-yb ml-auto pr-5 mt-8 text-right transition-all duration-700 ${
                ticketsHighlight ? "scale-125 text-yellow-300" : ""
              }`}
            >
              {tickets.toString().padStart(6, "0")}
            </p>
          </div>
          <div className="relative flex items-center justify-center mt-1">
            <Image
              src="/images/vector/balance/bg-total-meats.png"
              alt="Balance background"
              width={120}
              height={120}
              priority
              unoptimized
              className="w-full h-auto"
            />
            <p className="w-full text-[17px] absolute font-lilita text-white text-shadow-yb ml-auto pr-3 -mt-8 text-right">
              Meats
            </p>
            <p
              className={`w-full text-[15px] absolute font-lilita text-white text-shadow-yb ml-auto pr-5 mt-8 text-right transition-all duration-700 ${
                meatsHighlight ? "scale-125 text-red-400" : ""
              }`}
            >
              {meats.toString().padStart(6, "0")}
            </p>
          </div>
        </div>

        <h1 className="text-[46px] -rotate-2 text-center mt-2 font-lilita text-gradient-yb font-bold">
          Get Ticket
        </h1>

        <div className={cardClass}>
          {isLoading
            ? // Show 4 skeleton cards while loading
              Array(4)
                .fill(0)
                .map((_, index) => <SkeletonCard key={index} />)
            : TICKET_EXCHANGE_OPTIONS.map((option, index) => (
                <div
                  key={index}
                  className="relative flex items-center justify-center mt-1 mb-2 cursor-pointer"
                  onClick={() => handleCardClick(option)}
                >
                  <Image
                    src="/images/vector/balance/bg-ticket-list.png"
                    alt="Balance background"
                    width={317}
                    height={317}
                    priority
                    unoptimized
                  />
                  <div className="absolute inset-0 flex flex-col">
                    <div className="flex items-center pt-4">
                      <p className="font-lilita text-white ml-auto pr-4 text-shadow-yb text-[16px]">
                        GET {option.ticketsReceived} TICKET WITH{" "}
                        {option.meatsRequired} MEATS
                      </p>
                    </div>

                    <div className="flex items-center justify-between px-0 mt-auto pb-1">
                      <span className="font-lilita ml-10 text-white text-shadow-yb text-sm">
                        SWAP
                      </span>
                      <span className="font-lilita text-white mr-5 text-shadow-yb text-sm">
                        +{option.ticketsReceived}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
        </div>
      </div>

      {isSwapping && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
        </div>
      )}

      <AlertDialog
        isOpen={isAlertOpen}
        onClose={() => setIsAlertOpen(false)}
        onConfirm={handleSwapConfirm}
        message={
          selectedOption
            ? isError
              ? alertMessage ||
                `Insufficient meats! Need ${selectedOption.meatsRequired} meats.`
              : `Swap ${selectedOption.meatsRequired} meats for ${selectedOption.ticketsReceived} tickets?`
            : ""
        }
        showConfirm={!isError}
      />
    </main>
  );
}
