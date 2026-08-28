import projects from "./campus-projects.json";

export type CampusProject = {
  title: string;
  subtitle?: string;
  href: string;
  image: string;
};

export const campusProjects: readonly CampusProject[] = projects;
