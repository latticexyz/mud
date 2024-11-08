"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Stream } from "@cloudflare/stream-react";

type VideoModalProps = {
  isOpen: boolean;
  onClose: () => void;
  videoId: string;
};

const VideoModal = ({ isOpen, onClose, videoId }: VideoModalProps) => (
  <DialogPrimitive.Root open={isOpen} onOpenChange={onClose}>
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm" />
      {/* eslint-disable-next-line max-len */}
      <DialogPrimitive.Content className="fixed left-1/2 top-1/2 w-full max-w-6xl -translate-x-1/2 -translate-y-1/2 transform rounded-lg shadow-xl focus:outline-none">
        <div className="relative aspect-video bg-black/20 md:px-[calc((100%-1152px)/2)]">
          <Stream controls autoplay src={videoId} />
        </div>
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  </DialogPrimitive.Root>
);

type VideoPlayerProps = {
  videoId: string;
  children: React.ReactNode;
};

export default function VideoPlayer({ videoId, children }: VideoPlayerProps) {
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  return (
    <div className="cursor-pointer" onClick={openModal}>
      <VideoModal isOpen={isModalOpen} onClose={closeModal} videoId={videoId} />
      {children}
    </div>
  );
}
