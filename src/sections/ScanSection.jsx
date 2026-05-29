import { useRef, useState } from "react";
import { receiptService } from "../services/checkEngineService";
import "../styles/sections/scan-section.scss";

const ScanSection = () => {
  const cameraInputRef = useRef(null);
  const fileRef = useRef(null);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [photo, setPhoto] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState("idle");

  const openCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });

      streamRef.current = stream;
      setIsCameraOpen(true);

      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
      }, 0);
    } catch (err) {
      console.log("Камера недоступна:", err);
      cameraInputRef.current?.click();
    }
  };

  const takePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    const ctx = canvas.getContext("2d");

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    ctx.drawImage(video, 0, 0);

    const img = canvas.toDataURL("image/png");
    setPhoto(img);

    streamRef.current?.getTracks().forEach((t) => t.stop());
    setIsCameraOpen(false);
  };

  const openFiles = () => {
    fileRef.current?.click();
  };

  const handleFileChange = async (event) => {
  const file = event.target.files?.[0];

  if (!file) return;

  try {
    setIsUploading(true);
    setUploadStatus("uploading");

    await receiptService.uploadReceipt(file);

    setUploadStatus("success");

    setTimeout(() => {
      window.location.reload();
    }, 1000);
  } catch (error) {
    console.error("Помилка завантаження:", error);
    alert(error.message || "Не вдалося завантажити чек.");
    setUploadStatus("idle");
  } finally {
    setIsUploading(false);
    event.target.value = "";
  }
};

 return (
  <section className="scan-section">
    <div className="container">
      <button
        className="scan-section__block"
        onClick={openFiles}
        disabled={isUploading}
      >
        <span className="scan-section__icon-box">
          {uploadStatus === "uploading" && (
            <span className="scan-section__loader" />
          )}

          {uploadStatus === "success" && (
            <span className="scan-section__success">✓</span>
          )}

          {uploadStatus === "idle" && (
            <img
              className="scan-section__icon"
              src="/src/assets/icons/download-image.svg"
              alt=""
            />
          )}
        </span>

        <h2 className="scan-section__title">
          {uploadStatus === "uploading" && "Завантаження..."}
          {uploadStatus === "success" && "Завантажено"}
          {uploadStatus === "idle" && "Завантажте фото"}
        </h2>
      </button>

      {isCameraOpen && (
        <div className="scan-section__camera">
          <video ref={videoRef} playsInline />
          <button onClick={takePhoto}>Зробити фото</button>
        </div>
      )}

      {photo && (
        <div className="scan-section__preview">
          <img src={photo} alt="preview" />
        </div>
      )}

      <canvas ref={canvasRef} style={{ display: "none" }} />

      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        style={{ display: "none" }}
      />

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        style={{ display: "none" }}
      />
    </div>
  </section>
);
};

export default ScanSection;