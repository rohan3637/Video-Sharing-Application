const fs = require("fs");
const path = require("path");
const AWS = require("aws-sdk");
const ffmpeg = require("fluent-ffmpeg");
const ffmpegStatic = require("ffmpeg-static");
const publishUpdateMessageToKafka = require("./kafkaPublisher.controller.js");

ffmpeg.setFfmpegPath(ffmpegStatic);

const resolutions = [
  { resolution: "320x180", videoBitrate: "500k", audioBitrate: "64k" },
  { resolution: "854x480", videoBitrate: "1000k", audioBitrate: "128k" },
  { resolution: "1280x720", videoBitrate: "2500k", audioBitrate: "192k" },
];

const hlsFolder = "hls";

// Main transcode function
const transcode = async (id, key, title, description, author) => {
  const s3 = new AWS.S3({
    region: "ap-south-1",
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  });

  try {
    if (!fs.existsSync(hlsFolder)) {
      fs.mkdirSync(hlsFolder);
    }

    console.log("Transcoding begin...");
    const mp4FileName = key;

    // Download video from S3
    const writeStream = fs.createWriteStream("local.mp4");
    const readStream = s3
      .getObject({ Bucket: process.env.AWS_BUCKET, Key: key })
      .createReadStream();
    readStream.pipe(writeStream);
    await new Promise((resolve, reject) => {
      writeStream.on("finish", resolve);
      writeStream.on("error", reject);
    });

    const variantPlaylists = await Promise.all(
      resolutions.map(async ({ resolution, videoBitrate, audioBitrate }) => {
        const outputFileName = `${mp4FileName.replace(
          ".",
          "_"
        )}_${resolution}.m3u8`;
        const segmentFileName = `${mp4FileName.replace(
          ".",
          "_"
        )}_${resolution}_%03d.ts`;

        await new Promise((resolve, reject) => {
          ffmpeg("./local.mp4")
            .outputOptions([
              `-c:v h264`,
              `-b:v ${videoBitrate}`,
              `-c:a aac`,
              `-b:a ${audioBitrate}`,
              `-vf scale=${resolution}`,
              `-f hls`,
              `-hls_time 10`,
              `-hls_list_size 0`,
              `-hls_segment_filename hls/${segmentFileName}`,
            ])
            .output(`hls/${outputFileName}`)
            .on("end", () => resolve())
            .on("error", (err) => reject(err))
            .run();
        });

        return { resolution, outputFileName };
      })
    );
    let masterPlaylist = variantPlaylists
      .map((variantPlaylist) => {
        const { resolution, outputFileName } = variantPlaylist;
        const bandwidth =
          resolution === "320x180"
            ? 676800
            : resolution === "854x480"
            ? 1353600
            : 3230400;
        return `#EXT-X-STREAM-INF:BANDWIDTH=${bandwidth},RESOLUTION=${resolution}\n${outputFileName}`;
      })
      .join("\n");
    masterPlaylist = `#EXTM3U\n` + masterPlaylist;

    const masterPlaylistFileName = `${mp4FileName.replace(
      ".",
      "_"
    )}_master.m3u8`;
    const masterPlaylistPath = `hls/${masterPlaylistFileName}`;
    fs.writeFileSync(masterPlaylistPath, masterPlaylist);

    const files = fs.readdirSync(hlsFolder);
    let masterFileLocation;
    await Promise.all(
      files.map(async (file) => {
        if (!file.startsWith(mp4FileName.replace(".", "_"))) {
          return; // Skip files that don't match the pattern
        }
        const filePath = path.join(hlsFolder, file);
        const fileStream = fs.createReadStream(filePath);
        const uploadParams = {
          Bucket: process.env.AWS_BUCKET,
          Key: `${hlsFolder}/${file}`,
          Body: fileStream,
          ContentType: file.endsWith(".ts")
            ? "video/mp2t"
            : file.endsWith(".m3u8")
            ? "application/x-mpegURL"
            : null,
        };
        const uploadResult = await s3.upload(uploadParams).promise();
        if (file.endsWith("_master.m3u8")) {
          masterFileLocation = uploadResult.Location;
        }
      })
    );

    await publishUpdateMessageToKafka(
      id,
      title,
      description,
      author,
      masterFileLocation
    );
    console.log("Transcoding done...");
  } catch (err) {
    console.log("Error:", err);
  } finally {
    if (fs.existsSync("local.mp4")) fs.unlinkSync("local.mp4");
    if (fs.existsSync(hlsFolder)) {
      const files = fs.readdirSync(hlsFolder);
      for (const file of files) {
        const filePath = path.join(hlsFolder, file);
        fs.unlinkSync(filePath);
      }
      fs.rmdirSync(hlsFolder);
    }
  }
};

module.exports = transcode;
