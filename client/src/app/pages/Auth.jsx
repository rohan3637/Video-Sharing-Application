"use client";
import React from "react";
import { useSession, signIn, signOut } from "next-auth/react";

const Auth = () => {
  const { data } = useSession();

  return (
    <div className="m-10">
      <button
        type="submit"
        onClick={() => signIn("google")}
        className="text-white bg-gradient-to-br from-purple-600 to-blue-500 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2"
      >
        Sign In
      </button>
      <button
        type="submit"
        onClick={() => signOut()}
        className="text-white bg-gradient-to-br from-purple-600 to-blue-500 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2"
      >
        Sign Out
      </button>
    </div>
  );
};

export default Auth;