"use client";

import { useEffect } from "react";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";
import type { ISourceOptions } from "@tsparticles/engine";

export default function HomeParticles() {
  useEffect(() => {
    void initParticlesEngine(async (engine) => {
      await loadSlim(engine);
    });
  }, []);

  const options: ISourceOptions = {
    interactivity: {
      events: {
        onHover: {
          enable: true,
          mode: "grab",
        },
      },
    },
    particles: {
      color: {
        value: ["#bfbfbf", "#ffdb33"],
      },
      links: {
        color: ["#bfbfbf", "#ffdb33"],
        distance: 128,
        enable: true,
        opacity: 0.5,
      },
      move: {
        enable: true,
        speed: 1,
        straight: false,
      },
      number: {
        value: 32,
      },
      shape: {
        type: "square",
      },
    },
  };

  return <Particles className="absolute inset-0 -z-50" options={options} />;
}
