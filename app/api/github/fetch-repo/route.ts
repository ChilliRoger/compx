import { NextRequest, NextResponse } from 'next/server';
import { GitHubClient, filterCodeFiles } from '@/backend/utils/github';
import type { FetchRepoResponse } from '@/backend/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { repoUrl } = body;

    if (!repoUrl) {
      return NextResponse.json(
        { success: false, error: 'Repository URL is required' },
        { status: 400 }
      );
    }

    // Initialize GitHub client
    const githubClient = new GitHubClient(process.env.GITHUB_TOKEN);
    
    // Parse repo URL
    const parsed = githubClient.parseRepoUrl(repoUrl);
    if (!parsed) {
      return NextResponse.json(
        { success: false, error: 'Invalid GitHub repository URL' },
        { status: 400 }
      );
    }

    const { owner, repo } = parsed;

    // Fetch repo info
    const repoInfo = await githubClient.getRepo(owner, repo);
    
    // Get repo tree (all files)
    const tree = await githubClient.getRepoTree(owner, repo, repoInfo.default_branch);
    
    // Filter code files only
    const codeFiles = filterCodeFiles(tree.tree);
    
    // Limit to first 20 files for performance (can be adjusted)
    const filesToFetch = codeFiles.slice(0, 20);
    
    // Fetch file contents in parallel
    const fileContents = await Promise.all(
      filesToFetch.map(async (file) => {
        try {
          const content = await githubClient.getFileContent(owner, repo, file.path);
          return {
            path: file.path,
            content: content.decodedContent || '',
            size: file.size || 0,
          };
        } catch (error) {
          console.error(`Error fetching ${file.path}:`, error);
          return null;
        }
      })
    );

    // Filter out failed fetches
    const validFiles = fileContents.filter(f => f !== null);

    const response: FetchRepoResponse = {
      success: true,
      data: {
        repo: {
          name: repoInfo.name,
          full_name: repoInfo.full_name,
          owner: repoInfo.owner,
          default_branch: repoInfo.default_branch,
          html_url: repoInfo.html_url,
          description: repoInfo.description,
        },
        files: validFiles,
        totalFiles: codeFiles.length,
      },
    };

    return NextResponse.json(response);
  } catch (error: any) {
    console.error('Error fetching repository:', error);
    
    let errorMessage = 'Failed to fetch repository';
    if (error.response?.status === 404) {
      errorMessage = 'Repository not found';
    } else if (error.response?.status === 403) {
      errorMessage = 'GitHub API rate limit exceeded or access denied';
    } else if (error.message) {
      errorMessage = error.message;
    }

    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: error.response?.status || 500 }
    );
  }
}
