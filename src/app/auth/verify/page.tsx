"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import Spinner from "@/components/common/Spinner";
import { toast } from "react-toastify";

const Verify = () => {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [status, setStatus] = useState({
    loading: true,
    success: false,
    message: "",
  });

  const verifyEmail = useCallback(
    async (token: string) => {
      try {
        const response = await fetch(`/api/auth/verify?token=${token}`);
        const data = await response.json();

        if (response.ok) {
          setStatus({ loading: false, success: true, message: data.message });
          toast.success("Email verified successfully!");
          setTimeout(() => {
            router.push("/dashboard");
          }, 5000);
        } else {
          setStatus({
            loading: false,
            success: false,
            message: data.error || "An error occurred during verification.",
          });
          toast.error(data.error || "Verification failed. Please try again.");
        }
      } catch (error) {
        setStatus({
          loading: false,
          success: false,
          message: "An error occurred while verifying your email.",
        });
        toast.error("An unexpected error occurred. Please try again later.");
      }
    },
    [router]
  );

  useEffect(() => {
    const token = searchParams.get("token");
    if (token) {
      verifyEmail(token);
    } else {
      setStatus({
        loading: false,
        success: false,
        message: "No verification token found.",
      });
      toast.error("No verification token found. Please check your email link.");
    }
  }, [searchParams, verifyEmail]);

  if (status.loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner />
      </div>
    );
  }
  return (
    <div className="flex items-center flex-col justify-center w-full">
      <Image
        src="/logo.png"
        width={60}
        height={60}
        alt="NFTTOOLS logo"
        className="mb-4 text-center"
      />
      <p className="tagline text-sm mb-4 text-center">
        Let’s build something great
      </p>
      {status.success ? (
        <p className="text-center text-sm font-montserrat">
          Your email has been verified. Redirecting to your dashboard
        </p>
      ) : (
        <p className="text-center text-sm font-montserrat">{status.message}</p>
      )}
    </div>
  );
};

export default Verify;
