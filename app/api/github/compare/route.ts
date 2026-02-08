import { NextRequest, NextResponse } from 'next/server';
import { GitHubClient } from '@/backend/utils/github';
import { calculateRepoSimilarity } from '@/backend/utils/similarity';
import { filterCodeFiles } from '@/backend/utils/github';
import type { CompareReposRequest, CompareReposResponse } from '@/backend/types';

export async function POST(req: NextRequest) {
  try {
    const body: CompareReposRequest = await req.json();
    const { repo1Url, repo2Url } = body;

    if (!repo1Url || !repo2Url) {
      return NextResponse.json(
        { success: false, error: 'Both repository URLs are required' },
        { status: 400 }
      );
    }

    const githubClient = new GitHubClient(process.env.GITHUB_TOKEN);

    // Parse URLs
    const repo1Info = githubClient.parseRepoUrl(repo1Url);
    const repo2Info = githubClient.parseRepoUrl(repo2Url);

    if (!repo1Info || !repo2Info) {
      return NextResponse.json(
        { success: false, error: 'Invalid repository URL format' },
        { status: 400 }
      );
    }

    // Fetch both repositories
    const [repo1Data, repo2Data] = await Promise.all([
      githubClient.getRepo(repo1Info.owner, repo1Info.repo),
      githubClient.getRepo(repo2Info.owner, repo2Info.repo)
    ]);

    // Get file trees
    const [tree1, tree2] = await Promise.all([
      githubClient.getRepoTree(repo1Info.owner, repo1Info.repo),
      githubClient.getRepoTree(repo2Info.owner, repo2Info.repo)
    ]);

    // Filter code files
    const codeFiles1 = filterCodeFiles(tree1);
    const codeFiles2 = filterCodeFiles(tree2);

    // Limit to top 20 files from each repo for comparison
    const limitedFiles1 = codeFiles1.slice(0, 20);
    const limitedFiles2 = codeFiles2.slice(0, 20);

    // Fetch file contents in parallel
    const [files1, files2] = await Promise.all([
      githubClient.getMultipleFiles(
        repo1Info.owner,
        repo1Info.repo,
        limitedFiles1.map(f => f.path)
      ),
      githubClient.getMultipleFiles(
        repo2Info.owner,
        repo2Info.repo,
        limitedFiles2.map(f => f.path)
      )
    ]);

    // Calculate similarity
    const similarityResult = calculateRepoSimilarity(
      files1.map(f => ({ path: f.path, content: f.content })),
      files2.map(f => ({ path: f.path, content: f.content }))
    );

    const response: CompareReposResponse = {
      success: true,
      data: {
        repo1: {
          name: repo1Data.name,
          fullName: repo1Data.full_name,
          description: repo1Data.description || '',
          language: repo1Data.language || 'Unknown',
          stars: repo1Data.stargazers_count,
          fileCount: limitedFiles1.length,
        },
        repo2: {
          name: repo2Data.name,
          fullName: repo2Data.full_name,
          description: repo2Data.description || '',
          language: repo2Data.language || 'Unknown',
          stars: repo2Data.stargazers_count,
          fileCount: limitedFiles2.length,
        },
        similarity: {
          overall: similarityResult.overallSimilarity,
          matchedFiles: similarityResult.matchedFiles,
          topMatches: similarityResult.filePairs
            .sort((a, b) => b.similarity - a.similarity)
            .slice(0, 10)
            .map(pair => ({
              file1: pair.file1,
              file2: pair.file2,
              similarity: pair.similarity,
            })),
        },
      },
    };

    return NextResponse.json(response);

  } catch (error: any) {
    console.error('GitHub compare error:', error);
    
    if (error.response?.status === 404) {
      return NextResponse.json(
        { success: false, error: 'One or both repositories not found' },
        { status: 404 }
      );
    }

    if (error.response?.status === 403) {
      return NextResponse.json(
        { success: false, error: 'GitHub API rate limit exceeded. Please try again later.' },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { success: false, error: error.message || 'Failed to compare repositories' },
      { status: 500 }
    );
  }
}
