"use client";

import { Card } from "@/components/ui/card";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Tagline } from "@/components/pro-blocks/landing-page/tagline";

const testimonials = [
  {
    quote:
      "Shadcn UI Kit for Figma has completely transformed our design process. It's incredibly intuitive and saves us so much time. The components are beautifully crafted and customizable.",
    author: "Lando Norris",
    role: "Founder at Acme Inc.",
    avatar: "https://github.com/shadcn.png",
  },
  {
    quote:
      "The attention to detail in this UI kit is outstanding. We've seen a significant improvement in our development speed since implementing it. Highly recommended for any serious project.",
    author: "Sarah Chen",
    role: "Lead Designer at TechCorp",
    avatar: "https://github.com/shadcn.png",
  },
  {
    quote:
      "What impressed me most was how seamlessly it integrated with our existing workflow. The documentation is clear, and the component quality is consistently high.",
    author: "Marcus Rodriguez",
    role: "CTO at StartupX",
    avatar: "https://github.com/shadcn.png",
  },
];

export function TestimonialsSection4() {
  return (
    <section
      className="bg-muted/40 section-padding-y"
      aria-labelledby="testimonial-title"
    >
      {/* Main Content Container */}
      <div className="container-padding-x container mx-auto">
        {/* Content Wrapper */}
        <div className="flex flex-col items-center gap-10 md:gap-12">
          {/* Section Header */}
          <div className="section-title-gap-lg flex max-w-xl flex-col items-center text-center">
            {/* Category Tag */}
            <Tagline>Testimonial section</Tagline>
            {/* Main Title */}
            <h2 id="testimonial-title" className="heading-lg text-foreground">
              Social proof section title that focuses on trust and results
            </h2>
            {/* Section Description */}
            <p className="text-muted-foreground text-base">
              Write a brief introduction that sets up your testimonials'
              credibility. Mention key outcomes, industry relevance, or the
              scale of your success.
            </p>
          </div>

          {/* Testimonials Grid */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            {testimonials.map((testimonial, index) => (
              <Card
                key={index}
                className="flex flex-col justify-between gap-6 p-6 shadow-sm md:p-8"
              >
                {/* Testimonial Quote */}
                <p className="text-foreground text-base">
                  &quot;{testimonial.quote}&quot;
                </p>

                {/* Author Information */}
                <div className="flex items-center gap-4">
                  {/* Author Avatar */}
                  <Avatar className="h-10 w-10">
                    <AvatarImage
                      src={testimonial.avatar}
                      alt={testimonial.author}
                    />
                  </Avatar>
                  {/* Author Details */}
                  <div className="flex flex-col">
                    <p className="text-foreground text-base font-medium">
                      {testimonial.author}
                    </p>
                    <p className="text-muted-foreground text-base">
                      {testimonial.role}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
