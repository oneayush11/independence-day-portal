import React, { useState, useEffect } from "react";

const images = [
  { src: "/images/slide1-flag.jpg", alt: "Indian flag waving" },
  { src: "/images/slide2-chakra.jpg", alt: "Ashoka Chakra golden emblem" },
  { src: "/images/slide3-fireworks.jpg", alt: "Independence Day fireworks celebration" },
  { src: "/images/slide4-tricolor.jpg", alt: "79 years of freedom tricolor banner" },
  { src: "/images/slide5-students.jpg", alt: "Students celebrating with flags" },
];

export default function ImageCarousel() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % images.length);
    }, 2000); // changes every 2 seconds
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative w-full h-64 sm:h-80 md:h-[420px] rounded-2xl overflow-hidden shadow-2xl border-4 border-white/70">
      {images.map((img, i) => (
        <img
          key={img.src}
          src={img.src}
          alt={img.alt}
          className={`absolute inset-0 w-full h-full object-cover transition-all ease-in-out duration-[1400ms] ${
            i === index ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-full"
          }`}
        />
      ))}

      {/* dots */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
        {images.map((_, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            aria-label={`Go to slide ${i + 1}`}
            className={`h-2.5 rounded-full transition-all duration-300 ${
              i === index ? "w-6 bg-saffron" : "w-2.5 bg-white/70 hover:bg-white"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
