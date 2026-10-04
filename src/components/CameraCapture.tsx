import React, { useState, useRef, useCallback } from 'react';
import { Camera, X, Check, RefreshCw } from 'lucide-react';
import { LanguageCode } from '../types';

interface CameraCaptureProps {
  onCapture: (imageDataUrl: string) => void;
  currentLanguage: LanguageCode;
  existingImage?: string;
}

export const CameraCapture: React.FC<CameraCaptureProps> = ({ onCapture, currentLanguage, existingImage }) => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(existingImage || null);
  const [isStarting, setIsStarting] = useState(false);
  const [error, setError] = useState<string>('');
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const startCamera = async () => {
    setError('');
    setIsStarting(true);
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 640 } } 
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err: any) {
      console.error("Camera error:", err);
      setError(currentLanguage === 'mr' ? 'कॅमेरा सुरू करण्यात समस्या आली. परवानगी तपासा.' : 'Could not access camera. Please check permissions.');
    } finally {
      setIsStarting(false);
    }
  };

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  }, [stream]);

  // Clean up on unmount
  React.useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      // Calculate a square crop from the center of the video
      const size = Math.min(video.videoWidth, video.videoHeight);
      const startX = (video.videoWidth - size) / 2;
      const startY = (video.videoHeight - size) / 2;
      
      canvas.width = size;
      canvas.height = size;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Draw the cropped square
        ctx.drawImage(video, startX, startY, size, size, 0, 0, size, size);
        
        // Convert to base64 jpeg
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        setCapturedImage(dataUrl);
        onCapture(dataUrl);
        stopCamera();
      }
    }
  };

  const retakePhoto = () => {
    setCapturedImage(null);
    onCapture('');
    startCamera();
  };

  return (
    <div className="w-full">
      <label className="block text-[11px] text-[#8E9B94] font-semibold uppercase mb-1">
        {currentLanguage === 'mr' ? 'प्रोफाईल फोटो (सक्तीचे नाही)' : 'Profile Photo (Optional)'}
      </label>
      
      {!stream && !capturedImage && (
        <div 
          onClick={startCamera}
          className="w-full h-32 border-2 border-dashed border-[#2C3631] hover:border-[#C2D66E] rounded-xl bg-[#0F1411] flex flex-col items-center justify-center cursor-pointer transition-colors group"
        >
          {isStarting ? (
            <RefreshCw className="w-6 h-6 text-[#8E9B94] animate-spin mb-2" />
          ) : (
            <Camera className="w-6 h-6 text-[#8E9B94] group-hover:text-[#C2D66E] mb-2 transition-colors" />
          )}
          <span className="text-xs text-[#8E9B94] group-hover:text-[#E5E9E7] transition-colors">
            {isStarting 
              ? (currentLanguage === 'mr' ? 'कॅमेरा सुरू होत आहे...' : 'Starting camera...') 
              : (currentLanguage === 'mr' ? 'फोटो काढण्यासाठी टॅप करा' : 'Tap to take photo')}
          </span>
          {error && <span className="text-[10px] text-red-400 mt-1 px-2 text-center">{error}</span>}
        </div>
      )}

      {stream && !capturedImage && (
        <div className="relative w-full h-48 bg-black rounded-xl overflow-hidden border border-[#2C3631]">
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            muted
            className="absolute inset-0 w-full h-full object-cover transform scale-x-[-1]"
          />
          <div className="absolute inset-0 border-2 border-[#C2D66E]/50 rounded-xl pointer-events-none" style={{ clipPath: 'circle(40% at 50% 50%)' }}></div>
          
          <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-4">
            <button
              type="button"
              onClick={stopCamera}
              className="w-10 h-10 rounded-full bg-red-500/80 text-white flex items-center justify-center backdrop-blur-sm"
            >
              <X className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={capturePhoto}
              className="w-10 h-10 rounded-full bg-[#C2D66E] text-[#0F1411] flex items-center justify-center shadow-lg"
            >
              <Camera className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {capturedImage && (
        <div className="flex items-center gap-4 bg-[#0F1411] border border-[#2C3631] p-3 rounded-xl">
          <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-[#C2D66E] shrink-0">
            <img src={capturedImage} alt="Profile" className="w-full h-full object-cover transform scale-x-[-1]" />
          </div>
          <div className="flex-1">
            <p className="text-xs text-[#E5E9E7] font-semibold mb-1">
              {currentLanguage === 'mr' ? 'फोटो जोडला' : 'Photo captured'}
            </p>
            <button
              type="button"
              onClick={retakePhoto}
              className="text-[10px] text-[#C2D66E] hover:underline flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3" />
              {currentLanguage === 'mr' ? 'पुन्हा काढा' : 'Retake photo'}
            </button>
          </div>
        </div>
      )}
      
      {/* Hidden canvas for processing */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};
