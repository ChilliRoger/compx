/**
 * Calculate similarity between two strings using various algorithms
 */

/**
 * Levenshtein distance (edit distance)
 */
export function levenshteinDistance(str1: string, str2: string): number {
  const len1 = str1.length;
  const len2 = str2.length;
  const matrix: number[][] = [];

  // Initialize matrix
  for (let i = 0; i <= len1; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= len2; j++) {
    matrix[0][j] = j;
  }

  // Fill matrix
  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      if (str1[i - 1] === str2[j - 1]) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }

  return matrix[len1][len2];
}

/**
 * Calculate similarity percentage using Levenshtein distance
 */
export function calculateSimilarity(str1: string, str2: string): number {
  if (str1 === str2) return 100;
  if (!str1 || !str2) return 0;

  const distance = levenshteinDistance(str1, str2);
  const maxLength = Math.max(str1.length, str2.length);
  
  const similarity = ((maxLength - distance) / maxLength) * 100;
  return Math.max(0, Math.min(100, similarity));
}

/**
 * Normalize code by removing comments and whitespace
 */
export function normalizeCode(code: string): string {
  return code
    // Remove single-line comments
    .replace(/\/\/.*/g, '')
    // Remove multi-line comments
    .replace(/\/\*[\s\S]*?\*\//g, '')
    // Remove extra whitespace
    .replace(/\s+/g, ' ')
    // Trim
    .trim();
}

/**
 * Compare two code files
 */
export function compareCodeFiles(
  content1: string,
  content2: string,
  normalize: boolean = true
): number {
  if (normalize) {
    content1 = normalizeCode(content1);
    content2 = normalizeCode(content2);
  }
  
  return calculateSimilarity(content1, content2);
}

/**
 * Calculate overall similarity between two repositories
 */
export interface RepoSimilarityResult {
  overallSimilarity: number;
  filePairs: Array<{
    file1: string;
    file2: string;
    similarity: number;
  }>;
  matchedFiles: number;
  totalFiles1: number;
  totalFiles2: number;
}

export function calculateRepoSimilarity(
  files1: Array<{ path: string; content: string }>,
  files2: Array<{ path: string; content: string }>
): RepoSimilarityResult {
  const filePairs: Array<{ file1: string; file2: string; similarity: number }> = [];
  
  // Compare files with similar names first
  for (const f1 of files1) {
    const fileName1 = f1.path.split('/').pop() || '';
    
    for (const f2 of files2) {
      const fileName2 = f2.path.split('/').pop() || '';
      
      // Compare files with same name or similar paths
      if (fileName1 === fileName2 || f1.path === f2.path) {
        const similarity = compareCodeFiles(f1.content, f2.content);
        
        if (similarity > 30) { // Only include if similarity > 30%
          filePairs.push({
            file1: f1.path,
            file2: f2.path,
            similarity,
          });
        }
      }
    }
  }
  
  // Calculate overall similarity
  const totalSimilarity = filePairs.reduce((sum, pair) => sum + pair.similarity, 0);
  const overallSimilarity = filePairs.length > 0 
    ? totalSimilarity / filePairs.length 
    : 0;
  
  // Sort by similarity descending
  filePairs.sort((a, b) => b.similarity - a.similarity);
  
  return {
    overallSimilarity: Math.round(overallSimilarity * 100) / 100,
    filePairs: filePairs.slice(0, 10), // Top 10 matches
    matchedFiles: filePairs.length,
    totalFiles1: files1.length,
    totalFiles2: files2.length,
  };
}

/**
 * Simple cosine similarity for code comparison
 */
export function cosineSimilarity(str1: string, str2: string): number {
  const words1 = str1.toLowerCase().split(/\s+/);
  const words2 = str2.toLowerCase().split(/\s+/);
  
  const uniqueWords = new Set([...words1, ...words2]);
  
  const vector1 = Array.from(uniqueWords).map(word => 
    words1.filter(w => w === word).length
  );
  
  const vector2 = Array.from(uniqueWords).map(word => 
    words2.filter(w => w === word).length
  );
  
  const dotProduct = vector1.reduce((sum, val, i) => sum + val * vector2[i], 0);
  const magnitude1 = Math.sqrt(vector1.reduce((sum, val) => sum + val * val, 0));
  const magnitude2 = Math.sqrt(vector2.reduce((sum, val) => sum + val * val, 0));
  
  if (magnitude1 === 0 || magnitude2 === 0) return 0;
  
  return (dotProduct / (magnitude1 * magnitude2)) * 100;
}
