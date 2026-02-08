import { NextRequest, NextResponse } from 'next/server';
import { GitHubClient } from '@/backend/utils/github';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { repoUrl, language, keywords, limit = 5 } = body;

    if (!repoUrl) {
      return NextResponse.json(
        { success: false, error: 'Repository URL is required' },
        { status: 400 }
      );
    }

    const githubClient = new GitHubClient(process.env.GITHUB_TOKEN);

    // Parse the input repo
    const repoInfo = githubClient.parseRepoUrl(repoUrl);
    if (!repoInfo) {
      return NextResponse.json(
        { success: false, error: 'Invalid repository URL format' },
        { status: 400 }
      );
    }

    // Get the original repo data
    const originalRepo = await githubClient.getRepo(repoInfo.owner, repoInfo.repo);

    // Build search query
    let searchQuery = '';
    
    // Use provided keywords or repo description
    if (keywords && keywords.length > 0) {
      searchQuery = keywords.join(' ');
    } else if (originalRepo.description) {
      // Extract key terms from description (first 5 words)
      const terms = originalRepo.description
        .split(' ')
        .filter(word => word.length > 3)
        .slice(0, 5)
        .join(' ');
      searchQuery = terms;
    } else {
      // Fallback to repo name
      searchQuery = originalRepo.name;
    }

    // Add language filter if provided or detected
    const searchLanguage = language || originalRepo.language;
    if (searchLanguage) {
      searchQuery += ` language:${searchLanguage}`;
    }

    // Add quality filters
    searchQuery += ' stars:>10';

    // Search for similar repositories
    const searchResults = await githubClient.searchRepos(searchQuery, limit + 1);

    // Filter out the original repo and limit results
    const similarRepos = searchResults
      .filter(repo => repo.full_name !== originalRepo.full_name)
      .slice(0, limit)
      .map(repo => ({
        name: repo.name,
        fullName: repo.full_name,
        description: repo.description || '',
        language: repo.language || 'Unknown',
        stars: repo.stargazers_count,
        url: repo.html_url,
        topics: repo.topics || [],
      }));

    return NextResponse.json({
      success: true,
      data: {
        originalRepo: {
          name: originalRepo.name,
          fullName: originalRepo.full_name,
          description: originalRepo.description || '',
          language: originalRepo.language || 'Unknown',
        },
        searchQuery,
        similarRepos,
        count: similarRepos.length,
      },
    });

  } catch (error: any) {
    console.error('Similar repos search error:', error);
    
    if (error.response?.status === 404) {
      return NextResponse.json(
        { success: false, error: 'Repository not found' },
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
      { success: false, error: error.message || 'Failed to find similar repositories' },
      { status: 500 }
    );
  }
}
