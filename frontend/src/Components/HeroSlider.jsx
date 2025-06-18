import { useEffect, useState } from "react";
import img1 from "../../public/images/man-delivering-groceries-customers.jpg";
import img2 from "../../public/images/medium-shot-blonde-girl-with-smartphone.jpg";
import img3 from "../../public/images/3.jpg";
import img4 from "../../public/images/4.jpg";

const promos = [
  {
    title: "MANGO CARNIVAL SPECIAL OFFER",
    description: "Exclusive discounts on mango products\nLimited time only",
    code: "MANGO09",
    image: img2,
  },
  {
    title: "GET FREE 500ML APPLETINI MOCKTAIL",
    description: "Every Sunday & Wednesday\nOn orders above AED 125",
    code: "MOCKTAIL",
    image: img1,
  },
  {
    title: "EID SPECIAL COMBO OFFER",
    description: "Flat 40% OFF on selected bundles\nHurry while stocks last",
    code: "EID40",
    image: img3,
  },
  {
    title: "HEALTHY START PACK",
    description: "Subscribe & Save\nDaily fresh deliveries to your door",
    code: "HEALTHY20",
    image: img4,
  },
];

const HeroSlider = ({ autoSlide = true, slideInterval = 5000 }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    if (!autoSlide) return;
    const slideTimer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % promos.length);
    }, slideInterval);
    return () => clearInterval(slideTimer);
  }, [autoSlide, slideInterval]);

  const goToSlide = (index) => setCurrentSlide(index);
  const goToNextSlide = () => setCurrentSlide((prev) => (prev + 1) % promos.length);
  const goToPrevSlide = () => setCurrentSlide((prev) => (prev - 1 + promos.length) % promos.length);

  return (
    <div className="relative mx-auto max-w-[1400px] h-[400px] rounded-xl overflow-hidden bg-white shadow-lg flex">
      {/* Left side - Text */}
      <div className="w-2/5 p-6 flex flex-col justify-center bg-gradient-to-br from-yellow-300 to-yellow-400 text-gray-900">
        <h2 className="text-2xl font-bold mb-2">{promos[currentSlide].title}</h2>
        <p className="text-base whitespace-pre-line mb-4">{promos[currentSlide].description}</p>
        <div className="bg-white text-black text-sm font-bold px-4 py-2 rounded-md inline-block shadow">
          Use Code: {promos[currentSlide].code}
        </div>
      </div>

      {/* Right side - Image */}
      <div className="w-3/5 relative">
        <img
          src={promos[currentSlide].image}
          alt="Promotion"
          className="absolute inset-0 w-full h-full object-cover"
        />
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={goToPrevSlide}
        className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 text-gray-800 p-2 rounded-full shadow hover:bg-white transition-all z-20"
        aria-label="Previous slide"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <button
        onClick={goToNextSlide}
        className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 text-gray-800 p-2 rounded-full shadow hover:bg-white transition-all z-20"
        aria-label="Next slide"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* Slide Indicators */}
      <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 z-20">
        {promos.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-2 h-2 rounded-full transition-all ${
              currentSlide === index ? "bg-yellow-500 w-4" : "bg-gray-300"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default HeroSlider;
