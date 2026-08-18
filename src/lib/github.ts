import { lsGet, Keys } from './storage';
import type { ProjectContent, LayoutFiles } from '../types';

const GITHUB_REPO = import.meta.env.VITE_GITHUB_REPO || 'github-ai-websites/github-ai-websites';

export function getGitHubToken(): string | null {
  return lsGet<string>(Keys.githubToken);
}

export async function githubFetch(path: string, token?: string) {
  const headers: HeadersInit = { Accept: 'application/vnd.github+json' };
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/contents/${path}`, { headers });
  if (!res.ok) throw new Error(`GitHub fetch failed ${res.status}`);
  return res.json();
}

export async function listProjects(): Promise<ProjectContent[]> {
  await githubFetch('projects');
  return [];
}

export async function listLayouts(): Promise<{ id: string; name: string }[]> {
  await githubFetch('layouts');
  return [];
}

export async function getProject(slug: string): Promise<ProjectContent | null> {
  const data = await githubFetch(`projects/${slug}.md`);
  if (!data.content) return null;
  return {
    id: slug,
    title: slug,
    slug,
    intro: '',
    story: '',
    ideas: '',
    media: '',
    closing: '',
    updatedAt: new Date().toISOString(),
  };
}

export async function getLayout(id: string): Promise<LayoutFiles | null> {
  const meta = await githubFetch(`layouts/${id}/layout.json`);
  return { meta: meta as any, html: '', css: '', js: '' };
}

export async function loginWithGitHub(clientId: string) {
  const redirect = `https://github.com/login/oauth/authorize?client_id=${clientId}&scope=repo`;
  window.location.href = redirect;
}