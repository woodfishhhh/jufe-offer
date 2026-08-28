export type GitHubRepository = {
  owner: string;
  repository: string;
  canonicalUrl: string;
};

export function isValidGitHubOwner(value: string) {
  return (
    value.length >= 1 &&
    value.length <= 39 &&
    /^[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?$/.test(value)
  );
}

function isValidGitHubRepository(value: string) {
  return (
    value.length >= 1 &&
    value.length <= 100 &&
    value !== "." &&
    value !== ".." &&
    /^[A-Za-z0-9._-]+$/.test(value)
  );
}

export function parseGitHubRepositoryUrl(value: string): GitHubRepository | null {
  let parsed: URL;
  try {
    parsed = new URL(value.trim());
  } catch {
    return null;
  }

  if (
    parsed.protocol !== "https:" ||
    !["github.com", "www.github.com"].includes(parsed.hostname.toLowerCase()) ||
    parsed.port ||
    parsed.username ||
    parsed.password ||
    parsed.search ||
    parsed.hash
  ) {
    return null;
  }

  const segments = parsed.pathname.split("/").filter(Boolean);
  if (segments.length !== 2) {
    return null;
  }

  const owner = segments[0];
  const rawRepository = segments[1];
  if (!owner || !rawRepository) {
    return null;
  }

  const repository = rawRepository.toLowerCase().endsWith(".git")
    ? rawRepository.slice(0, -4)
    : rawRepository;
  if (!isValidGitHubOwner(owner) || !isValidGitHubRepository(repository)) {
    return null;
  }

  return {
    owner,
    repository,
    canonicalUrl: `https://github.com/${owner}/${repository}`,
  };
}
