"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Stream } from "@cloudflare/stream-react";
import Image from "next/image";

type VideoThumbnailProps = {
  thumbnailUrl: string;
  alt: string;
  onClick: () => void;
};

const VideoThumbnail: React.FC<VideoThumbnailProps> = ({ onClick }) => (
  <button onClick={onClick} className="w-full h-full flex items-center justify-center">
    <div className="bg-[#484848] h-[79px] w-[79px] flex items-center justify-center">
      <Image src="/images/icons/play.svg" alt="Play" width={32} height={32} />
    </div>
  </button>
);

type VideoModalProps = {
  isOpen: boolean;
  onClose: () => void;
  videoId: string;
};

const VideoModal: React.FC<VideoModalProps> = ({ isOpen, onClose, videoId }) => (
  <DialogPrimitive.Root open={isOpen} onOpenChange={onClose}>
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm" />
      {/* eslint-disable-next-line max-len */}
      <DialogPrimitive.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-6xl rounded-lg shadow-xl focus:outline-none">
        <div className="relative aspect-video bg-black/20 md:px-[calc((100%-1152px)/2)]">
          <Stream controls autoplay src={videoId} />
          <DialogPrimitive.Close className="absolute top-[-12px] right-[-12px] p-1.5 rounded-full opacity-50 bg-white/20 hover:opacity-90 transition-opacity">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <path d="M18 6L6 18" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M6 6L18 18" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </DialogPrimitive.Close>
        </div>
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  </DialogPrimitive.Root>
);

type VideoPlayerProps = {
  videoId: string;
  thumbnailUrl: string;
};

export default function VideoPlayer({ videoId, thumbnailUrl }: VideoPlayerProps) {
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  return (
    <div className="h-full flex items-center justify-center">
      <VideoThumbnail thumbnailUrl={thumbnailUrl} alt="Video thumbnail" onClick={openModal} />
      <VideoModal isOpen={isModalOpen} onClose={closeModal} videoId={videoId} />
    </div>
  );
}
