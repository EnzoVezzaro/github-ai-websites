export type ContentSlot = 'intro' | 'story' | 'ideas' | 'media' | 'closing';

export interface ProjectContent {
  id: string;
  title: string;
  slug: string;
  author?: string;
  intro: string;
  story: string;
  ideas: string;
  media: string;
  closing: string;
  updatedAt: string;
}

export interface LayoutMeta {
  id: string;
  name: string;
  author?: string;
  description?: string;
  version: string;
  updatedAt: string;
}

export interface LayoutFiles {
  meta: LayoutMeta;
  html: string;
  css: string;
  js?: string;
}

export interface ExplorerState {
  projectId: string;
  layoutId: string;
}

export interface GitHubUser {
  login: string;
  avatar_url: string;
  name?: string;
}