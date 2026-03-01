import * as fs from "node:fs";
import * as path from "node:path";
import type {
  ContributionCounts,
  OrgContributions,
  RepoContributions,
} from "../types/index";

const CACHE_DIR = path.join(process.cwd(), ".cache");
const CACHE_FILE = path.join(CACHE_DIR, "contributions.json");
const CACHE_MAX_AGE_MS = 60 * 60 * 1000; // 1 hour

const ORG = "braintrustdata";
const AUTHOR = "AbhiPrasad";

interface CachedData {
  timestamp: number;
  data: OrgContributions;
}

function readCache(): OrgContributions | null {
  try {
    const raw = fs.readFileSync(CACHE_FILE, "utf-8");
    const cached: CachedData = JSON.parse(raw);
    const token = process.env.GITHUB_TOKEN;
    const age = Date.now() - cached.timestamp;

    // If no token, use cache regardless of age
    if (!token) {
      console.log(
        "[contributions] No GITHUB_TOKEN, using cached data (age: " +
          Math.round(age / 1000 / 60) +
          "m)"
      );
      return cached.data;
    }

    // If cache is fresh, use it
    if (age < CACHE_MAX_AGE_MS) {
      console.log("[contributions] Using cached data");
      return cached.data;
    }

    return null;
  } catch {
    return null;
  }
}

function writeCache(data: OrgContributions): void {
  try {
    fs.mkdirSync(CACHE_DIR, { recursive: true });
    const cached: CachedData = { timestamp: Date.now(), data };
    fs.writeFileSync(CACHE_FILE, JSON.stringify(cached, null, 2));
  } catch (err) {
    console.warn("[contributions] Failed to write cache:", err);
  }
}

async function githubFetch(
  url: string,
  token: string,
  accept?: string
): Promise<any> {
  const headers: Record<string, string> = {
    Authorization: `token ${token}`,
    "User-Agent": "abhiprasad-site-builder",
  };
  if (accept) {
    headers["Accept"] = accept;
  }
  const response = await fetch(url, { headers });
  if (!response.ok) {
    throw new Error(`GitHub API error: ${response.status} ${response.statusText} for ${url}`);
  }
  return response.json();
}

async function fetchAllSearchResults(
  baseUrl: string,
  token: string,
  accept?: string
): Promise<any[]> {
  const allItems: any[] = [];
  let page = 1;
  const perPage = 100;

  while (true) {
    const separator = baseUrl.includes("?") ? "&" : "?";
    const url = `${baseUrl}${separator}per_page=${perPage}&page=${page}`;
    const data = await githubFetch(url, token, accept);
    allItems.push(...data.items);

    if (allItems.length >= data.total_count || data.items.length < perPage) {
      break;
    }
    // GitHub Search API caps at 1000 results
    if (allItems.length >= 1000) break;
    page++;
  }

  return allItems;
}

function countInWindow(
  dates: Date[],
  windowDays: number
): number {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - windowDays);
  return dates.filter((d) => d >= cutoff).length;
}

function buildCounts(dates: Date[]): ContributionCounts {
  return {
    total: dates.length,
    last7days: countInWindow(dates, 7),
    last30days: countInWindow(dates, 30),
  };
}

function addCounts(a: ContributionCounts, b: ContributionCounts): ContributionCounts {
  return {
    total: a.total + b.total,
    last7days: a.last7days + b.last7days,
    last30days: a.last30days + b.last30days,
  };
}

const zeroCounts: ContributionCounts = { total: 0, last7days: 0, last30days: 0 };

export async function fetchContributions(): Promise<OrgContributions | null> {
  // Check cache first
  const cached = readCache();
  if (cached) return cached;

  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    console.warn(
      "[contributions] No GITHUB_TOKEN set and no cache available, skipping contributions"
    );
    return null;
  }

  try {
    console.log("[contributions] Fetching contribution data from GitHub...");

    // Fetch merged PRs and commits in parallel
    const [prs, commits] = await Promise.all([
      fetchAllSearchResults(
        `https://api.github.com/search/issues?q=author:${AUTHOR}+org:${ORG}+type:pr+is:merged`,
        token
      ),
      fetchAllSearchResults(
        `https://api.github.com/search/commits?q=author:${AUTHOR}+org:${ORG}`,
        token,
        "application/vnd.github.cloak-preview+json"
      ),
    ]);

    // Group by repo
    // PR repo extraction: repository_url ends with /repos/{org}/{repo}
    const prsByRepo = new Map<string, Date[]>();
    for (const pr of prs) {
      const repoUrl: string = pr.repository_url || "";
      const repoName = repoUrl.split("/").pop() || "unknown";
      if (!prsByRepo.has(repoName)) prsByRepo.set(repoName, []);
      prsByRepo.get(repoName)!.push(new Date(pr.closed_at || pr.updated_at));
    }

    // Commit repo extraction: repository.name
    const commitsByRepo = new Map<string, Date[]>();
    for (const commit of commits) {
      const repoName: string = commit.repository?.name || "unknown";
      if (!commitsByRepo.has(repoName)) commitsByRepo.set(repoName, []);
      commitsByRepo.get(repoName)!.push(
        new Date(commit.commit?.author?.date || commit.commit?.committer?.date)
      );
    }

    // Build repo list with counts
    const allRepoNames = new Set([...prsByRepo.keys(), ...commitsByRepo.keys()]);
    const repos: RepoContributions[] = [];

    for (const repoName of allRepoNames) {
      const prDates = prsByRepo.get(repoName) || [];
      const commitDates = commitsByRepo.get(repoName) || [];
      repos.push({
        name: repoName,
        url: `https://github.com/${ORG}/${repoName}`,
        prs: buildCounts(prDates),
        commits: buildCounts(commitDates),
      });
    }

    // Sort repos by total contributions (PRs + commits) descending
    repos.sort(
      (a, b) =>
        b.prs.total + b.commits.total - (a.prs.total + a.commits.total)
    );

    // Calculate totals
    let totalPrs: ContributionCounts = { ...zeroCounts };
    let totalCommits: ContributionCounts = { ...zeroCounts };
    for (const repo of repos) {
      totalPrs = addCounts(totalPrs, repo.prs);
      totalCommits = addCounts(totalCommits, repo.commits);
    }

    const result: OrgContributions = {
      lastUpdated: new Date().toISOString(),
      repos,
      totals: {
        prs: totalPrs,
        commits: totalCommits,
      },
    };

    writeCache(result);
    console.log(
      `[contributions] Fetched: ${totalPrs.total} PRs, ${totalCommits.total} commits across ${repos.length} repos`
    );

    return result;
  } catch (error) {
    console.warn("[contributions] Failed to fetch contributions:", error);
    return null;
  }
}
