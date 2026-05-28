import { useRef, useState } from "react";
import "../styles/sections/scan-section.scss";

const ScanSection = () => {
  const cameraInputRef = useRef(null);
  const fileRef = useRef(null);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [photo, setPhoto] = useState(null);

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

  return (
    <section className="scan-section">
      <div className="container">

        <button
          className="scan-section__block"
          onClick={openCamera}
        >
          <img className="scan-section__icon" src="/src/assets/icons/scan.svg" alt="" />
          <h2 className="scan-section__title">Скануйте чек</h2>
        </button>

        <button
          className="scan-section__block"
          onClick={openFiles}
        >
          <img className="scan-section__icon" src="/src/assets/icons/download-image.svg" alt="" />
          <h2 className="scan-section__title">Завантажте фото/PDF</h2>
        </button>

        {/* {isCameraOpen && (
          <div className="scan-section__camera">
            <video ref={videoRef} playsInline />
            <button onClick={takePhoto}>Зробити фото</button>
          </div>
        )}

        {photo && (
          <div className="scan-section__preview">
            <img src={photo} alt="preview" />
          </div>
        )} */}

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
          accept="image/*,application/pdf"
          style={{ display: "none" }}
        />

      </div>
    </section>
  );
};

export default ScanSection;