import { User } from "@/interface/user.interface";
import {
  CreateCredential,
  P256Credential,
} from "@/interface/web-authn.interface";

export async function createAccount(
  credential: CreateCredential
): Promise<User> {
  if (!credential) {
    throw new Error("Failed to create WebAuthn credential");
  }
  const response = await fetch("/api/auth/signup", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      credential,
    }),
  });

  const user: User = await response.json();
  return user;
}

export async function retrieveAccount(credential: P256Credential) {
  if (!credential) {
    throw new Error("Failed to create WebAuthn credential");
  }

  try {
    const response = await fetch("/api/auth/signin", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        credential,
      }),
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status} ${response.statusText}`);
    }

    const user: User = await response.json();
    console.log(user);
    return user;
  } catch (error: any) {
    throw new Error(`Failed to retrieve wallet account: ${error.message}`);
  }
}
