import { useState } from 'react';

interface PostCardProps {
  title: string;
  description: string;
  imageUrl: string;
  tags: string[];
}

export function PostCard({ title, description, imageUrl }: PostCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="relative group cursor-pointer overflow-hidden aspect-square"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <img
        src={imageUrl}
        alt={title}
        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
      />
      
      {/* Title overlay - always visible */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/30 via-black/40 to-black/90 flex items-end p-6">
        <h3 className="text-white">{title}</h3>
      </div>

      {/* Description overlay - visible on hover */}
      <div
        className={`absolute inset-0 bg-gradient-to-b from-white/20 via-black/60 to-black/95 p-6 flex items-center justify-center transition-opacity duration-300 ${
          isHovered ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <div className="text-center">
          <h3 className="text-white mb-3">{title}</h3>
          <p className="text-white/80 text-sm">{description}</p>
        </div>
      </div>
    </div>
  );
}
