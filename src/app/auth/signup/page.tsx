"use client";

import { mail } from "@/assets";
import InvisibleIcon from "@/assets/svg/InvisibleIcon";
import VisibleIcon from "@/assets/svg/VisibleIcon";
import Spinner from "@/components/common/Spinner";
import Image from "next/image";
import Link from "next/link";
import React, { useState } from "react";
import { toast } from "react-toastify";

const SignUp = () => {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    password: "",
    acceptTerms: false,
    signupForUpdates: false,
  });

  const [status, setStatus] = useState({ loading: false, submitted: false });
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  const isFormValid =
    formData.name &&
    formData.email &&
    formData.password &&
    formData.acceptTerms;

  async function createAccount(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus((prev) => ({ ...prev, loading: true }));

    try {
      const { name, email, password, signupForUpdates } = formData;
      const body = { name, email, password, signupForUpdates };

      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(data.message);
        setStatus({ loading: false, submitted: true });
      } else {
        toast.error(data.message || "An error occurred during signup");
        setStatus({ loading: false, submitted: false });
      }
    } catch (error: any) {
      console.error("Signup error:", error);
      toast.error("An unexpected error occurred. Please try again.");
      setStatus({ loading: false, submitted: false });
    }
  }

  return (
    <div className="flex items-center flex-col justify-center w-full mt-8 md:mt-0">
      <Image
        src="/logo.png"
        width={60}
        height={60}
        alt="NFTTOOLS logo"
        className="mb-4 text-center"
      />
      <h5 className="h5 mb-4">Create an account</h5>
      <p className="tagline text-sm mb-4 text-center">
        Let’s build something great
      </p>

      {status.submitted && isFormValid ? (
        <div className="mt-4 flex flex-col gap-4 items-center justify-center">
          <Image src={mail} width={128} height={128} alt="mail" />

          <h2 className="text-[#F1F1F1] font-semibold my-4 font-poppins text-[20px] text-center">
            Thank you!
          </h2>

          <p className="text-center text-sm font-montserrat">
            We sent an email to{" "}
            <span className="text-[#7364DB]">{formData.email} </span>
            click the confirmation link in the email to verify your account
          </p>
        </div>
      ) : (
        <form onSubmit={createAccount} className="mt-7 w-full">
          <div>
            <label
              htmlFor="name"
              className="block text-sm text-Neutral/Neutral-1100-[night] font-sans"
            >
              Name
            </label>
            <input
              type="string"
              name="name"
              id="name"
              value={formData.name}
              onChange={handleChange}
              className="mt-2 block w-full border rounded-lg shadow-sm p-4 border-Neutral-BG-[night] bg-Neutral/Neutral-300-[night]"
              required
            />
          </div>
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
              onChange={handleChange}
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
                onChange={handleChange}
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

          <div className="mt-4">
            <label className="inline-flex items-center">
              <input
                type="checkbox"
                name="acceptTerms"
                checked={formData.acceptTerms}
                onChange={handleChange}
                className="form-checkbox text-Brand/Brand-1 h-5 w-5"
                required
              />
              <span className="ml-2 text-sm text-Neutral/Neutral-1100-[night] font-sans">
                I accept the&nbsp;
                <span className=" text-Brand/Brand-1 underline">
                  <Link href={"/tos"}>terms of service</Link>
                </span>
                &nbsp; and&nbsp;
                <span>
                  <Link
                    className=" text-Brand/Brand-1 underline"
                    href={"/privacy"}
                  >
                    privacy policy
                  </Link>
                </span>
                &nbsp;
              </span>
            </label>
          </div>
          <div className="mt-4">
            <label className="inline-flex items-center">
              <input
                type="checkbox"
                name="signupForUpdates"
                checked={formData.signupForUpdates}
                onChange={handleChange}
                className="form-checkbox text-Brand/Brand-1 h-5 w-5"
              />
              <span className="ml-2 text-sm text-Neutral/Neutral-1100-[night] font-sans">
                Signup for product updates
              </span>
            </label>
          </div>

          {status.loading ? (
            <div className="mt-4">
              <Spinner />
            </div>
          ) : (
            <button
              type="submit"
              disabled={!isFormValid}
              className={`w-full bg-Brand/Brand-1 text-white p-4 rounded-md hover:bg-[#5C4DB5] mt-5 font-sans uppercase ${
                !isFormValid ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              Create account
            </button>
          )}

          <p className="mt-4 text-center">
            Already have an account?{" "}
            <Link href="/auth/signin" className="text-[#7364DB]">
              Sign in
            </Link>
          </p>
        </form>
      )}
    </div>
  );
};

export default SignUp;

interface FormData {
  name: string;
  email: string;
  password: string;
  acceptTerms: boolean;
  signupForUpdates: boolean;
}
