/**
 * Calculate Levenshtein distance (edit distance) between two strings
 * Allows typos to be counted as correct answers
 */
function levenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = []

  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i]
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1]
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1, // insertion
          matrix[i - 1][j] + 1, // deletion
        )
      }
    }
  }

  return matrix[b.length][a.length]
}

/**
 * Validate an answer with typo tolerance
 * Allows up to 1 character difference (edit distance)
 */
export function validateAnswer(userAnswer: string, correctAnswer: string, tolerance = 1): boolean {
  const normalize = (str: string) => str.trim().toLowerCase()
  const user = normalize(userAnswer)
  const correct = normalize(correctAnswer)

  // Exact match
  if (user === correct) return true

  // Calculate Levenshtein distance for typo tolerance
  const distance = levenshteinDistance(user, correct)
  return distance <= tolerance
}
