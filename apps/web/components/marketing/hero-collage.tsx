"use client";

import Image from "next/image";
import { useState } from "react";

export function HeroCollage({ images }: { images: string[] }) {
  const [slots] = useState<number[]>(() => {
    if (images.length <= 4) return [0, 1, 2, 3];
    const shuffled = [...images.keys()]
      .sort(() => Math.random() - 0.5)
      .slice(0, 4);
    return shuffled;
  });

  const labels = ["Kitchen", "Wardrobe", "Living Room", "Study"];
  const [s0, s1, s2, s3] = [slots[0] ?? 0, slots[1] ?? 1, slots[2] ?? 2, slots[3] ?? 3];

  return (
    <div className="relative grid grid-cols-2 gap-2 sm:gap-3 h-[300px] sm:h-[380px] lg:h-[480px]">
      {/* Left — tall, spans 2 rows */}
      <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden row-span-2">
        {images[s0] && (
          <Image
            src={images[s0]!}
            alt={labels[0]!}
            fill
            className="object-cover"
            priority
          />
        )}
      </div>

      {/* Top right */}
      <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden">
        {images[s1] && (
          <Image
            src={images[s1]!}
            alt={labels[1]!}
            fill
            className="object-cover"
            priority
          />
        )}
      </div>

      {/* Bottom right — two small */}
      <div className="grid grid-cols-2 gap-2 sm:gap-3">
        <div className="relative rounded-xl sm:rounded-2xl overflow-hidden">
          {images[s2] && (
            <Image
              src={images[s2]!}
              alt={labels[2]!}
              fill
              className="object-cover"
            />
          )}
        </div>
        <div className="relative rounded-xl sm:rounded-2xl overflow-hidden">
          {images[s3] && (
            <Image
              src={images[s3]!}
              alt={labels[3]!}
              fill
              className="object-cover"
            />
          )}
        </div>
      </div>
    </div>
  );
}