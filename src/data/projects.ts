import initialProjects from "./projects.json";

export interface Project {
  id: number;
  title: string;
  category: "Logos" | "Infographics" | "Posters" | "Branding" | "Art" | string;
  image: string;
  additionalImages?: string[];
  description: string;
  tools: string[];
  behanceUrl?: string;
}

export const projects: Project[] = initialProjects as Project[];
