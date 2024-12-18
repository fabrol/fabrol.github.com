export interface Project {
  title: string;
  description: string;
  slug: string;
  url?: string;
  github?: string;
  technologies?: string[];
  featured?: boolean;
}

export const projects: Project[] = [
  {
    title: "Pomodoro Timer",
    description:
      "A minimalist, animated pomodoro timer to help with focus and productivity",
    slug: "pomodoro-timer",
    url: "https://www.tomatotimer.lol/",
    github: "https://github.com/fabrol/pomodoro_app",
    technologies: ["React", "TypeScript", "Framer Motion"],
    featured: true,
  },
];
