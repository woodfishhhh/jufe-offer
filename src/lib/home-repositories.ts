import "server-only";

import { connection } from "next/server";

import { prisma } from "@/lib/prisma";
import { readRemoteResourceList, shouldUseRemoteResources } from "@/lib/remote-resources";
import {
  CAMPUS_PROJECT_CATEGORY,
  SITE_REPOSITORY_URL,
  repositoryCardFromProfile,
  repositoryCardFromResource,
  type RepositoryCardData,
} from "@/lib/repository-card";
import { toResourceDto, type RepositoryProfileDto } from "@/lib/resources";

export type HomeRepositoryData = {
  campusProjects: RepositoryCardData[];
  siteRepository: RepositoryCardData | null;
};

export async function readHomeRepositoryData(): Promise<HomeRepositoryData> {
  await connection();

  try {
    if (shouldUseRemoteResources()) {
      const [resources, siteProfile] = await Promise.all([
        readRemoteResourceList(CAMPUS_PROJECT_CATEGORY),
        prisma.repositoryProfile.findUnique({
          where: { repositoryUrl: SITE_REPOSITORY_URL },
        }),
      ]);

      return {
        campusProjects: resources.map(repositoryCardFromResource),
        siteRepository: siteProfile
          ? repositoryCardFromProfile({
              repositoryUrl: siteProfile.repositoryUrl,
              owner: siteProfile.owner,
              name: siteProfile.name,
              description: siteProfile.description,
              stars: siteProfile.stars,
              avatarPath: siteProfile.avatarPath,
              avatarLogin: siteProfile.avatarLogin,
              primaryLanguage: siteProfile.primaryLanguage,
              syncedAt: siteProfile.syncedAt.toISOString(),
            } satisfies RepositoryProfileDto)
          : null,
      };
    }

    const [resources, siteProfile] = await Promise.all([
      prisma.resource.findMany({
        where: { category: CAMPUS_PROJECT_CATEGORY },
        include: { repositoryProfile: true },
        orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }, { title: "asc" }],
      }),
      prisma.repositoryProfile.findUnique({
        where: { repositoryUrl: SITE_REPOSITORY_URL },
      }),
    ]);

    const siteRepository = siteProfile
      ? repositoryCardFromProfile({
          repositoryUrl: siteProfile.repositoryUrl,
          owner: siteProfile.owner,
          name: siteProfile.name,
          description: siteProfile.description,
          stars: siteProfile.stars,
          avatarPath: siteProfile.avatarPath,
          avatarLogin: siteProfile.avatarLogin,
          primaryLanguage: siteProfile.primaryLanguage,
          syncedAt: siteProfile.syncedAt.toISOString(),
        } satisfies RepositoryProfileDto)
      : null;

    return {
      campusProjects: resources.map((resource) =>
        repositoryCardFromResource(toResourceDto(resource)),
      ),
      siteRepository,
    };
  } catch (error) {
    console.error("Failed to read homepage repository profiles.", error);
    return { campusProjects: [], siteRepository: null };
  }
}
