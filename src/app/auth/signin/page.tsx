"use client";

import InvisibleIcon from "@/assets/svg/InvisibleIcon";
import VisibleIcon from "@/assets/svg/VisibleIcon";
import Spinner from "@/components/common/Spinner";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState, FormEvent } from "react";
import { toast } from "react-toastify";

const SignIn = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({ email: "", password: "" });
  const [status, setStatus] = useState({ loading: false, submitted: false });
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateForm = () => {
    let isValid = true;
    const newErrors = { email: "", password: "" };

    if (!formData.email) {
      newErrors.email = "Email is required";
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Invalid email address";
      isValid = false;
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateForm()) return;

    setStatus((prev) => ({ ...prev, loading: true }));

    try {
      const response = await fetch("/api/auth/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
        credentials: "include", // This is important for including cookies
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Login successful");
        router.replace("/dashboard");
      } else {
        toast.error(data.message || "An error occurred during login");
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setStatus((prev) => ({ ...prev, loading: false, submitted: true }));
    }
  };

  const togglePasswordVisibility = () =>
    setIsPasswordVisible(!isPasswordVisible);

  return (
    <div className="flex items-center flex-col justify-center w-full">
      <Image
        src="/logo.png"
        width={60}
        height={60}
        alt="NFTTOOLS logo"
        className="mb-4 text-center"
      />
      <h5 className="h5 mb-4">Welcome Back!</h5>
      <p className="tagline text-sm mb-4 text-center">
        Let’s build something great
      </p>

      <form onSubmit={onSubmit} className="mt-7 w-full">
        <div className="mt-4">
          <label
            htmlFor="email"
            className="block text-sm text-Neutral/Neutral-1100-[night] font-sans"
          >
            Email
          </label>
          <input
            type="email"
            name="email"
            id="email"
            value={formData.email}
            onChange={handleInputChange}
            className="mt-2 block w-full border rounded-lg shadow-sm p-4 border-Neutral-BG-[night] bg-Neutral/Neutral-300-[night]"
            required
          />
        </div>
        <div className="mt-4">
          <label
            htmlFor="password"
            className="block text-sm text-Neutral/Neutral-1100-[night] font-sans"
          >
            Password
          </label>
          <div className="relative mt-2">
            <input
              type={isPasswordVisible ? "text" : "password"}
              name="password"
              id="password"
              value={formData.password}
              onChange={handleInputChange}
              className="block w-full border rounded-lg shadow-sm p-4 border-Neutral-BG-[night] bg-Neutral/Neutral-300-[night]"
              required
            />
            <button
              type="button"
              onClick={togglePasswordVisibility}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5"
            >
              {isPasswordVisible ? <VisibleIcon /> : <InvisibleIcon />}
            </button>
          </div>
        </div>

        {status.loading ? (
          <div className="mt-4">
            <Spinner />
          </div>
        ) : (
          <button
            type="submit"
            className="w-full bg-Brand/Brand-1 text-white p-4 rounded-md hover:bg-[#5C4DB5] mt-4 font-sans"
          >
            Submit
          </button>
        )}
        <div className="flex justify-end">
          <Link
            href={"/auth/reset-password"}
            className="text-[#8083A3] text-sm mt-4"
          >
            Forgot password?
          </Link>
        </div>

        <p className="mt-4 text-center">
          Don’t have an account?{" "}
          <Link href="/auth/signup" className="text-[#7364DB]">
            Sign up
          </Link>
        </p>
      </form>
    </div>
  );
};

export default SignIn;
