"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { v4 as uuidv4 } from "uuid";

const UploadForm = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [author, setAuthor] = useState("");
  const { data } = useSession();
  const router = useRouter();

  if (!data) {
    router.push("/");
    return;
  }

  function handleSubmit(e) {
    e.preventDefault();
    handleFileUpload(selectedFile);
  }

  function handleFileChange(e) {
    setSelectedFile(e.target.files[0]);
  }

  function generateRandomFilename(originalFilename) {
    const extension = originalFilename.split(".").pop(); // get file extension
    const randomUuid = uuidv4().substr(0, 8); // generate random uuid with 7-8 characters
    return `${randomUuid}.${extension}`; // combine random uuid and extension
  }

  async function handleFileUpload(file) {
    if (!title || !author) {
      alert("Title and Author are required fields.");
      return;
    }
    try {
      const formData = new FormData();
      const filename = generateRandomFilename(file.name);
      formData.append("filename", filename);
      const initializeRes = await axios.post(
        "http://localhost:5000/upload/initialize",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      const { uploadId } = initializeRes.data;
      const chunkSize = 10 * 1024 * 1024; // 10mb chunks
      const totalChunks = Math.ceil(file.size / chunkSize);

      let start = 0;
      const uploadPromises = [];
      for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
        const chunk = file.slice(start, start + chunkSize);
        start += chunkSize;

        const chunkFormData = new FormData();
        chunkFormData.append("filename", filename);
        chunkFormData.append("chunk", chunk);
        chunkFormData.append("totalChunks", totalChunks);
        chunkFormData.append("chunkIndex", chunkIndex);
        chunkFormData.append("uploadId", uploadId);

        const uploadPromise = axios.post(
          "http://localhost:5000/upload",
          chunkFormData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );
        uploadPromises.push(uploadPromise);
      }
      await Promise.all(uploadPromises);
      await axios.post("http://localhost:5000/upload/complete", {
        filename: filename,
        totalChunks: totalChunks,
        uploadId: uploadId,
        title: title,
        description: description,
        author: author,
      });
      alert("Video uploading. Please wait.....");
      router.push("/");
    } catch (err) {
      console.log("Error uploading files: ", err);
    }
  }

  return (
    <div className="container mx-auto max-w-lg p-10">
      <form encType="multipart/form-data">
        <div className="mb-4">
          <input
            type="text"
            name="title"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="px-3 py-2 w-full border rounded-md focus:outline-none focus:border-blue-500"
          />
        </div>
        <div className="mb-4">
          <input
            type="text"
            name="description"
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="px-3 py-2 w-full border rounded-md focus:outline-none focus:border-blue-500"
          />
        </div>
        <div className="mb-4">
          <input
            type="text"
            name="author"
            placeholder="Author"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            required
            className="px-3 py-2 w-full border rounded-md focus:outline-none focus:border-blue-500"
          />
        </div>
        <div className="mb-4">
          <input
            type="file"
            name="file"
            onChange={handleFileChange}
            className="px-3 py-2 w-full border rounded-md focus:outline-none focus:border-blue-500"
          />
        </div>
        <button
          type="button"
          onClick={handleSubmit}
          className="text-white bg-gradient-to-br from-purple-600 to-blue-500 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
        >
          Upload
        </button>
      </form>
    </div>
  );
};

export default UploadForm;
