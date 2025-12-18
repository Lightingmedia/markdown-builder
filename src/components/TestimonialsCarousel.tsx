import { useState, useEffect, useCallback } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import { Card, CardContent } from "@/components/ui/card";
import { Quote } from "lucide-react";
import Autoplay from "embla-carousel-autoplay";
import logoTechscale from "@/assets/logo-techscale.png";
import logoDataflow from "@/assets/logo-dataflow.png";
import logoGreentech from "@/assets/logo-greentech.png";
import logoNexus from "@/assets/logo-nexus.png";

const testimonials = [
  {
    quote: "LightRail's photonic computing has reduced our AI training costs by 60%. The energy savings alone have transformed our sustainability metrics.",
    name: "Sarah Chen",
    role: "VP of Infrastructure",
    company: "TechScale AI",
    logo: logoTechscale
  },
  {
    quote: "The transition from GPU clusters to LightRail was seamless. We saw immediate improvements in both performance and power consumption.",
    name: "Marcus Thompson",
    role: "CTO",
    company: "DataFlow Systems",
    logo: logoDataflow
  },
  {
    quote: "Finally, AI infrastructure that aligns with our carbon neutrality goals. LightRail is the future of sustainable computing.",
    name: "Emma Rodriguez",
    role: "Chief Sustainability Officer",
    company: "GreenTech Ventures",
    logo: logoGreentech
  },
  {
    quote: "The unit economics simply work. We've scaled our AI operations 3x while actually reducing our energy bill. That's unprecedented.",
    name: "James Park",
    role: "Director of Engineering",
    company: "Nexus Computing",
    logo: logoNexus
  }
];

const TestimonialsCarousel = () => {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!api) return;

    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap());

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap());
    });
  }, [api]);

  const scrollTo = useCallback((index: number) => {
    api?.scrollTo(index);
  }, [api]);

  return (
    <div className="max-w-5xl mx-auto">
      <Carousel 
        setApi={setApi}
        opts={{ 
          loop: true,
          duration: 30,
        }}
        plugins={[
          Autoplay({
            delay: 4000,
            stopOnInteraction: false,
            stopOnMouseEnter: true,
          }),
        ]}
      >
        <CarouselContent>
          {testimonials.map((testimonial, i) => (
            <CarouselItem key={i} className="md:basis-1/2 lg:basis-1/2 pl-4">
              <Card className="h-full border-2 hover:border-primary/30 transition-colors">
                <CardContent className="p-6 flex flex-col h-full">
                  <Quote className="h-8 w-8 text-primary/30 mb-4" />
                  <p className="text-lg mb-6 flex-1 text-foreground/90 leading-relaxed">
                    "{testimonial.quote}"
                  </p>
                  <div className="flex items-center gap-4 pt-4 border-t border-border">
                    <div className="h-12 w-12 rounded-lg overflow-hidden bg-muted flex items-center justify-center">
                      <img 
                        src={testimonial.logo} 
                        alt={`${testimonial.company} logo`} 
                        className="h-10 w-10 object-contain"
                      />
                    </div>
                    <div>
                      <div className="font-semibold">{testimonial.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {testimonial.role}, {testimonial.company}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="hidden md:flex -left-12" />
        <CarouselNext className="hidden md:flex -right-12" />
      </Carousel>
      
      {/* Dot Indicators */}
      <div className="flex justify-center gap-2 mt-6">
        {Array.from({ length: count }).map((_, index) => (
          <button
            key={index}
            onClick={() => scrollTo(index)}
            className={`h-2 rounded-full transition-all duration-300 ${
              index === current 
                ? "w-6 bg-primary" 
                : "w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default TestimonialsCarousel;
