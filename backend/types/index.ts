// GitHub API Response Types
export interface GitHubRepo {
  name: string;
  full_name: string;
  owner: {
    login: string;
  };
  default_branch: string;
  html_url: string;
  description: string | null;
}

export interface GitHubContent {
  name: string;
  path: string;
  sha: string;
  size: number;
  url: string;
  html_url: string;
  git_url: string;
  download_url: string | null;
  type: 'file' | 'dir';
  content?: string;
  encoding?: string;
}

export interface GitHubTree {
  sha: string;
  url: string;
  tree: GitHubTreeItem[];
  truncated: boolean;
}

export interface GitHubTreeItem {
  path: string;
  mode: string;
  type: 'blob' | 'tree';
  sha: string;
  size?: number;
  url: string;
}

// API Request/Response Types
export interface FetchRepoRequest {
  repoUrl: string;
  includeFiles?: string[]; // Optional: specific file patterns to include
}

export interface FetchRepoResponse {
  success: boolean;
  data?: {
    repo: GitHubRepo;
    files: RepoFile[];
    totalFiles: number;
  };
  error?: string;
}

export interface RepoFile {
  path: string;
  content: string;
  size: number;
  language?: string;
}

export interface CompareReposRequest {
  repo1Url: string;
  repo2Url: string;
}

export interface CompareReposResponse {
  success: boolean;
  data?: {
    similarityScore: number; // 0-100
    matchedFiles: FileSimilarity[];
    repo1Files: number;
    repo2Files: number;
  };
  error?: string;
}

export interface FileSimilarity {
  file1: string;
  file2: string;
  similarity: number;
}

// Smart Contract Types
export interface ContractComparisonRequest {
  address1: string;
  address2: string;
  chainId?: number;
}

export interface ContractComparisonResponse {
  success: boolean;
  data?: {
    comparisonId: string;
    similarityScore: number;
    address1: string;
    address2: string;
    bytecodeSize1: number;
    bytecodeSize2: number;
  };
  error?: string;
}

// Yellow Network Types
export interface YellowSessionData {
  sessionId: string;
  balance: bigint;
  address: string;
}
