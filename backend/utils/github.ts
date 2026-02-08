import axios, { AxiosInstance } from 'axios';

const GITHUB_API_BASE = 'https://api.github.com';

/**
 * GitHub API Client
 */
export class GitHubClient {
  private client: AxiosInstance;
  private token?: string;

  constructor(token?: string) {
    this.token = token || process.env.GITHUB_TOKEN;
    
    this.client = axios.create({
      baseURL: GITHUB_API_BASE,
      headers: {
        Accept: 'application/vnd.github.v3+json',
        ...(this.token && { Authorization: `token ${this.token}` }),
      },
    });
  }

  /**
   * Parse GitHub repository URL
   * Supports: https://github.com/owner/repo or owner/repo
   */
  parseRepoUrl(url: string): { owner: string; repo: string } | null {
    try {
      // Remove trailing slash and .git
      const cleanUrl = url.replace(/\/$/, '').replace(/\.git$/, '');
      
      // Match github.com URL
      const urlMatch = cleanUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/);
      if (urlMatch) {
        return { owner: urlMatch[1], repo: urlMatch[2] };
      }
      
      // Match owner/repo format
      const shortMatch = cleanUrl.match(/^([^\/]+)\/([^\/]+)$/);
      if (shortMatch) {
        return { owner: shortMatch[1], repo: shortMatch[2] };
      }
      
      return null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Get repository information
   */
  async getRepo(owner: string, repo: string) {
    const response = await this.client.get(`/repos/${owner}/${repo}`);
    return response.data;
  }

  /**
   * Get repository tree (all files recursively)
   */
  async getRepoTree(owner: string, repo: string, branch: string = 'main') {
    try {
      const response = await this.client.get(
        `/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`
      );
      return response.data;
    } catch (error: any) {
      // Try 'master' if 'main' fails
      if (error.response?.status === 404 && branch === 'main') {
        return this.getRepoTree(owner, repo, 'master');
      }
      throw error;
    }
  }

  /**
   * Get file content
   */
  async getFileContent(owner: string, repo: string, path: string) {
    const response = await this.client.get(`/repos/${owner}/${repo}/contents/${path}`);
    const data = response.data;
    
    if (data.content && data.encoding === 'base64') {
      const content = Buffer.from(data.content, 'base64').toString('utf-8');
      return { ...data, decodedContent: content };
    }
    
    return data;
  }

  /**
   * Get multiple files content in parallel
   */
  async getMultipleFiles(owner: string, repo: string, paths: string[]) {
    const promises = paths.map(path => 
      this.getFileContent(owner, repo, path).catch(err => ({
        path,
        error: err.message,
      }))
    );
    
    return Promise.all(promises);
  }

  /**
   * Search repositories by query
   */
  async searchRepos(query: string, limit: number = 5) {
    const response = await this.client.get(`/search/repositories`, {
      params: {
        q: query,
        sort: 'stars',
        order: 'desc',
        per_page: limit,
      },
    });
    
    return response.data.items;
  }
}

/**
 * Filter code files from tree (ignore binaries, images, etc.)
 */
export function filterCodeFiles(tree: any[]): any[] {
  const codeExtensions = [
    '.js', '.ts', '.jsx', '.tsx', '.py', '.java', '.cpp', '.c', '.h',
    '.go', '.rs', '.rb', '.php', '.sol', '.vy', '.move', '.cairo',
    '.cs', '.swift', '.kt', '.scala', '.r', '.m', '.mm',
  ];
  
  const ignorePatterns = [
    /node_modules/,
    /\.git\//,
    /dist\//,
    /build\//,
    /\.next\//,
    /coverage\//,
    /\.cache\//,
    /\.vscode\//,
    /\.idea\//,
  ];
  
  return tree.filter((item: any) => {
    if (item.type !== 'blob') return false;
    
    // Check if should ignore
    if (ignorePatterns.some(pattern => pattern.test(item.path))) {
      return false;
    }
    
    // Check if it's a code file
    const hasCodeExtension = codeExtensions.some(ext => item.path.endsWith(ext));
    
    return hasCodeExtension;
  });
}

/**
 * Get repository statistics
 */
export function getRepoStats(tree: any[]) {
  const codeFiles = filterCodeFiles(tree);
  
  const languages: Record<string, number> = {};
  
  codeFiles.forEach(file => {
    const ext = file.path.split('.').pop();
    if (ext) {
      languages[ext] = (languages[ext] || 0) + 1;
    }
  });
  
  return {
    totalFiles: codeFiles.length,
    languages,
    topLanguage: Object.keys(languages).reduce((a, b) => 
      languages[a] > languages[b] ? a : b
    , ''),
  };
}
