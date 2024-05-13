"use client";
import React, { useRef, useEffect } from "react";
import Hls from "hls.js";

const VideoPlayer = (props) => {
  //console.log("running from hls....", props.url);
  const videoRef = useRef(null);
  const src = props.url;

  useEffect(() => {
    const video = videoRef.current;

    if (Hls.isSupported()) {
      const hls = new Hls();
      hls.attachMedia(video);
      hls.loadSource(src);
      hls.on(Hls.Events.MANIFEST_PARSED, function () {
        console.log("playing video");
        video.play();
      });
    } else {
      console.log("HLS is not supported");
    }
  }, [src]);

  return (
    <div style={{ width: "360px", height: "180px" }}>
      <video ref={videoRef} controls />
    </div>
  );
};

export default VideoPlayer;
