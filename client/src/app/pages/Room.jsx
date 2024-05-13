"use client";
import React, { useState } from "react";
import dynamic from "next/dynamic";
const ReactPlayer = dynamic(() => import("react-player"), { ssr: false });

const Room = () => {
  const [userStream, setUserStream] = useState();

  async function streamUser() {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true,
    });
    setUserStream(stream);
  }

  return (
    <>
      <div className="m-10">
        <ReactPlayer
          url="https://www.youtube.com/watch?v=lqMIz8aWRgQ"
          width="900px"
          height="520px"
          ml="20px"
          controls={true}
        />
      </div>
      <div>
        <button
          type="button"
          onClick={streamUser}
          class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800 m-10"
        >
          Stream
        </button>
      </div>
      <div className="m-10">
        <ReactPlayer
          width="1280px"
          height="720px"
          url={userStream}
          controls={true}
        />
      </div>
    </>
  );
};

export default Room;
