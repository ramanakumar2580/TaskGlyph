"use client";

import React, { useState, useRef, useEffect } from "react";
import { Mic, StopCircle, Play, Pause, X, Check } from "lucide-react";

type Props = {
  onClose: () => void;
  onAdd: (file: File) => void;
};

export function AudioRecorder({ onClose, onAdd }: Props) {
  const [isRecording, setIsRecording] = useState(false);
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [permissionError, setPermissionError] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // Request mic permission on mount
  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then(() => {
        // [THE FIX] Changed 'stream =>' to '() =>'
        setPermissionError(false);
      })
      .catch((err) => {
        console.error("Mic permission denied:", err);
        setPermissionError(true);
      });
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setIsRecording(true);
      setAudioURL(null);
      setAudioFile(null);
      audioChunksRef.current = [];

      mediaRecorderRef.current = new MediaRecorder(stream);
      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };
      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/wav",
        });
        const audioUrl = URL.createObjectURL(audioBlob);
        const file = new File([audioBlob], "recording.wav", {
          type: "audio/wav",
        });
        setAudioURL(audioUrl);
        setAudioFile(file);
      };
      mediaRecorderRef.current.start();
    } catch (err) {
      console.error("Error starting recording:", err);
      setPermissionError(true);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleAddClick = () => {
    if (audioFile) {
      onAdd(audioFile);
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-lg shadow-xl w-96 p-6"
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Record Audio</h3>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {permissionError && (
          <div
            className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
            role="alert"
          >
            <strong className="font-bold">Error:</strong>
            <span className="block sm:inline">
              {" "}
              Microphone permission denied. Please allow mic access in your
              browser settings.
            </span>
          </div>
        )}

        {/* Player / Recorder */}
        <div className="flex flex-col items-center justify-center h-32">
          {!audioURL && (
            <button
              type="button"
              onClick={isRecording ? stopRecording : startRecording}
              className={`flex items-center justify-center w-20 h-20 rounded-full text-white transition-all
                ${
                  isRecording
                    ? "bg-red-500 hover:bg-red-600"
                    : "bg-blue-500 hover:bg-blue-600"
                }
              `}
              disabled={permissionError}
            >
              {isRecording ? (
                <StopCircle className="w-8 h-8" />
              ) : (
                <Mic className="w-8 h-8" />
              )}
            </button>
          )}

          {audioURL && (
            <div className="w-full flex items-center gap-3">
              <button
                type="button"
                onClick={togglePlay}
                className="flex-shrink-0 w-12 h-12 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center"
              >
                {isPlaying ? (
                  <Pause className="w-6 h-6" />
                ) : (
                  <Play className="w-6 h-6" />
                )}
              </button>
              <audio
                ref={audioRef}
                src={audioURL}
                onEnded={() => setIsPlaying(false)}
                className="w-full"
              />
            </div>
          )}
        </div>

        {/* Footer Buttons */}
        <div className="flex justify-end gap-3 mt-6 border-t pt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleAddClick}
            disabled={!audioFile}
            className="px-4 py-2 text-sm font-medium text-white bg-black rounded-md hover:bg-gray-800 focus:outline-none disabled:opacity-50"
          >
            <Check className="w-4 h-4 inline-block mr-1" />
            Add to Note
          </button>
        </div>
      </div>
    </div>
  );
}
