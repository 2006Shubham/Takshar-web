import { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const UploadContext = createContext();

export const useUpload = () => useContext(UploadContext);

export const UploadProvider = ({ children }) => {
  const [uploads, setUploads] = useState({}); // Stores all active uploads by spark ID

  // Prevent accidental tab closure during active uploads
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      const activeUploads = Object.values(uploads).some(u => u.status === 'uploading' || u.status === 'signing');
      if (activeUploads) {
        e.preventDefault();
        e.returnValue = ''; // Triggers the browser's default "Are you sure you want to leave?" prompt
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [uploads]);

  const startUpload = async (file, spark) => {
    const uploadId = spark._id;

    // 1. Initialize upload state
    setUploads(prev => ({
      ...prev,
      [uploadId]: { file, spark, progress: 0, status: 'signing', error: null }
    }));

    try {
      // 2. Get Signature
      const signRes = await fetch("http://localhost:5000/api/uploadsignature", { credentials: "include" });
      if (!signRes.ok) throw new Error("Failed to authenticate upload.");
      const auth = await signRes.json();

      const fd = new FormData();
      fd.append("file", file);
      fd.append("timestamp", auth.timestamp);
      fd.append("signature", auth.signature);
      fd.append("api_key", auth.apiKey);
      fd.append("folder", auth.folder);

      setUploads(prev => ({ ...prev, [uploadId]: { ...prev[uploadId], status: 'uploading' } }));

      // 3. Upload to Cloudinary with Axios for Progress Tracking
      const uploadRes = await axios.post(
        `https://api.cloudinary.com/v1_1/${auth.cloudName}/video/upload`,
        fd,
        {
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploads(prev => ({
              ...prev,
              [uploadId]: { ...prev[uploadId], progress: percentCompleted }
            }));
          }
        }
      );

      const data = uploadRes.data;
      const thumbnailUrl = `https://res.cloudinary.com/${auth.cloudName}/video/upload/so_1/${data.public_id}.jpg`;

      // 4. Save to Backend
      const newVideo = {
        secure_url: data.secure_url,
        duration: data.duration,
        spark: spark,
        owner: spark.to,
        thumbnailUrl: thumbnailUrl
      };

      const completeRes = await fetch("http://localhost:5000/api/completespark", {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completeSparkSubmision: newVideo })
      });

      // NEW: 4.5 Change the spark status in the database
      if (completeRes.ok) {
        await fetch("http://localhost:5000/api/changesparkstatus", {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            newStatus: 'success',
            id: uploadId
          })
        });
      }

      // 5. Mark as complete in the global context
      setUploads(prev => ({ ...prev, [uploadId]: { ...prev[uploadId], status: 'success', progress: 100 } }));

    } catch (error) {
      console.error(error);
      setUploads(prev => ({
        ...prev,
        [uploadId]: { ...prev[uploadId], status: 'error', error: error.message || "Upload failed" }
      }));
    }
  };

  const removeUpload = (uploadId) => {
    setUploads(prev => {
      const newUploads = { ...prev };
      delete newUploads[uploadId];
      return newUploads;
    });
  };

  return (
    <UploadContext.Provider value={{ uploads, startUpload, removeUpload }}>
      {children}
    </UploadContext.Provider>
  );
};