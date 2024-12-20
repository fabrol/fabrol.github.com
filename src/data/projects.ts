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
    title: "farhanabrol.com",
    description:
      "A minimalist personal website built from scratch with no frameworks. In an age of AI-generated code, going back to basics and maintaining full control over the system.",
    slug: "personal-website",
    url: "https://www.farhanabrol.com",
    github: "https://github.com/fabrol/fabrol.github.io",
    technologies: ["TypeScript", "Deno", "HTML", "CSS"],
    featured: true,
  },
  {
    title: "tomatotimer.lol",
    description:
      "A minimalist, animated pomodoro timer that will fill your screen with tomatoes.",
    slug: "tomatotimer",
    url: "https://www.tomatotimer.lol/",
    github: "https://github.com/fabrol/pomodoro_app",
    technologies: ["React", "TypeScript", "Framer Motion"],
    featured: true,
  },
  {
    title: "What did I do?",
    description:
      "A visualization tool for Microsoft To-Do completed tasks, helping users reflect on their productivity patterns over time.",
    slug: "what-did-i-do",
    url: "https://msft-todo-completed.vercel.app/",
    github: "https://github.com/fabrol/msft-todo-completed",
    technologies: ["Next.js", "TypeScript", "Microsoft Graph API"],
    featured: true,
  },
];
