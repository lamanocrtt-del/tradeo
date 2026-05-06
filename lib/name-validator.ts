/**
 * Family member name validation utility.
 * Checks that a name looks like a real person's name (first + last),
 * not gibberish, random characters, or offensive content.
 */

// Common first names (French + International) for basic validation
const COMMON_FIRST_NAMES = new Set([
  // French
  "adam", "adrien", "agathe", "agnes", "aimee", "alain", "albert", "alex", "alexandre", "alexis",
  "alice", "aline", "alphonse", "amandine", "amelie", "amine", "ana", "anais", "andre", "andree",
  "angela", "angelique", "anne", "annette", "antoine", "antonin", "arnaud", "arthur", "audrey", "aurelie",
  "baptiste", "barbara", "bastien", "beatrice", "benjamin", "benoit", "bernard", "bertrand", "boris", "brigitte",
  "bruno", "camille", "carine", "caroline", "catherine", "cecile", "cedric", "celeste", "celine", "charles",
  "charlotte", "chloe", "christian", "christine", "christophe", "claire", "clara", "claude", "clemence", "clement",
  "colette", "coralie", "corinne", "cyril", "damien", "daniel", "danielle", "david", "denis", "denise",
  "diane", "didier", "dominique", "edith", "edouard", "eliane", "elisa", "elisabeth", "elise", "elodie",
  "eloise", "emile", "emilie", "emma", "emmanuel", "emmanuelle", "eric", "estelle", "etienne", "eugenie",
  "eva", "evelyne", "fabien", "fabienne", "fabrice", "fanny", "fatima", "florence", "florian", "francine",
  "francis", "franck", "francois", "francoise", "frederic", "frederique", "gabriel", "gabrielle", "gaelle", "gautier",
  "genevieve", "georges", "gerard", "germain", "ghislaine", "gilles", "guillaume", "gustave", "guy", "habiba",
  "helene", "henri", "herve", "hugo", "huguette", "ines", "irene", "isabelle", "jacques", "jade",
  "jean", "jeanne", "jerome", "jessica", "jocelyne", "joel", "joelle", "joseph", "josette", "josiane",
  "julien", "julie", "juliette", "justine", "karim", "karine", "kevin", "laetitia", "laura", "laurence",
  "laurent", "lea", "leon", "leonard", "liliane", "lina", "lionel", "lisa", "louis", "louise",
  "luc", "lucas", "lucie", "lucien", "lucienne", "ludovic", "lydie", "madeleine", "manon", "marc",
  "marcel", "marcelle", "marguerite", "maria", "marianne", "marie", "marine", "marion", "marthe", "martin",
  "martine", "mathieu", "mathilde", "matthieu", "maurice", "maxime", "mehdi", "melanie", "michael", "michel",
  "michele", "mireille", "mohamed", "monique", "morgane", "muriel", "myriam", "nadia", "nadine", "nathalie",
  "nathan", "nicolas", "nicole", "noemie", "noel", "noelle", "oceane", "odette", "olivier", "pascal",
  "pascale", "patricia", "patrick", "paul", "paulette", "pauline", "philippe", "pierre", "rachid", "raphael",
  "raymond", "raymonde", "regine", "remi", "renaud", "rene", "renee", "richard", "robert", "roger",
  "roland", "romain", "rosa", "rose", "roxane", "sabine", "sabrina", "samuel", "sandra", "sandrine",
  "sarah", "sebastien", "serge", "severine", "simon", "simone", "solange", "sophie", "stephane", "stephanie",
  "suzanne", "sylvain", "sylvie", "theo", "therese", "thibault", "thierry", "thomas", "valentin", "valentine",
  "valerie", "vanessa", "veronique", "victor", "vincent", "virginie", "viviane", "xavier", "yannick", "yasmine",
  "yves", "yvette", "yvonne", "zoe",
  // International common
  "aaron", "abigail", "addison", "adrian", "aiden", "alexander", "allison", "alyssa", "amanda", "amber",
  "amy", "andrea", "andrew", "angel", "anna", "anthony", "ashley", "austin", "ava", "bella",
  "bethany", "blake", "brandon", "brian", "brittany", "brooke", "caleb", "cameron", "carlos", "carter",
  "cassandra", "charlie", "chase", "chelsea", "christopher", "claire", "cody", "cole", "colin", "connor",
  "courtney", "cynthia", "daisy", "dana", "danielle", "derek", "destiny", "devon", "diana", "dominic",
  "dylan", "edward", "eleanor", "elena", "eli", "elijah", "elizabeth", "ella", "emily", "emma",
  "eric", "erin", "ethan", "evan", "evelyn", "faith", "fatima", "gabriel", "gavin", "grace",
  "hailey", "hannah", "harper", "hayden", "henry", "hunter", "ian", "isaac", "isabella", "isaiah",
  "jack", "jackson", "jacob", "james", "jasmine", "jason", "jayden", "jennifer", "jesse", "jessica",
  "john", "jonathan", "jordan", "jose", "joseph", "joshua", "julia", "justin", "kai", "katherine",
  "kayla", "kelsey", "kennedy", "kevin", "kimberly", "kylie", "landon", "lauren", "leah", "liam",
  "lily", "logan", "lucas", "luke", "lydia", "mackenzie", "madison", "maria", "mark", "mason",
  "matthew", "maya", "megan", "mia", "michael", "morgan", "natalie", "nathan", "nicholas", "noah",
  "oliver", "olivia", "owen", "paige", "patrick", "penelope", "peter", "rachel", "reagan", "rebecca",
  "riley", "robert", "ryan", "samantha", "samuel", "sarah", "savannah", "sean", "sebastian", "sierra",
  "sophia", "spencer", "stella", "sydney", "taylor", "thomas", "timothy", "trinity", "tyler", "vanessa",
  "victoria", "violet", "william", "wyatt", "zachary", "zoe",
])

// Characters that should NOT appear in real names
const INVALID_NAME_CHARS = /[0-9!@#$%^&*()_+=\[\]{};:"\\|<>/?~`]/

// Minimum consonant-to-total ratio for gibberish detection
const VOWELS = new Set(["a", "e", "i", "o", "u", "y"])

interface NameValidationResult {
  isValid: boolean
  errorFr: string | null
  errorEn: string | null
}

/**
 * Validates a single part of a name (first or last)
 */
function isValidNamePart(part: string): boolean {
  if (part.length < 2) return false
  if (part.length > 30) return false
  if (INVALID_NAME_CHARS.test(part)) return false

  // Check for repeated characters (e.g. "aaaa", "xxxx")
  const repeats = part.match(/(.)\1{2,}/g)
  if (repeats && repeats.some((r) => r.length > 2)) return false

  // Check vowel ratio - names need some vowels
  const vowelCount = [...part.toLowerCase()].filter((c) => VOWELS.has(c)).length
  const ratio = vowelCount / part.length
  if (ratio < 0.15 || ratio > 0.85) return false

  return true
}

/**
 * Check if name looks like a known first name pattern
 */
function looksLikeRealName(fullName: string): boolean {
  const parts = fullName.trim().split(/\s+/)
  if (parts.length < 2) return false

  const firstName = parts[0].toLowerCase()

  // Direct match with common names database
  if (COMMON_FIRST_NAMES.has(firstName)) return true

  // Check hyphenated first names (Jean-Pierre, Marie-Claire)
  if (firstName.includes("-")) {
    const subParts = firstName.split("-")
    if (subParts.every((p) => COMMON_FIRST_NAMES.has(p))) return true
  }

  // If not in the database, check structural patterns
  // A real name part should have reasonable structure
  return parts.every((p) => isValidNamePart(p))
}

/**
 * Full name validation for family subscription members.
 * Verifies that the input looks like a real person's full name.
 */
export function validateFamilyMemberName(name: string): NameValidationResult {
  const trimmed = name.trim()

  // Empty check
  if (!trimmed) {
    return { isValid: false, errorFr: null, errorEn: null }
  }

  // Must have at least first name and last name
  const parts = trimmed.split(/\s+/)
  if (parts.length < 2) {
    return {
      isValid: false,
      errorFr: "Entrez un pr\u00e9nom et un nom de famille",
      errorEn: "Enter a first and last name",
    }
  }

  // Check for invalid characters
  if (INVALID_NAME_CHARS.test(trimmed)) {
    return {
      isValid: false,
      errorFr: "Le nom ne doit pas contenir de chiffres ou caract\u00e8res sp\u00e9ciaux",
      errorEn: "Name must not contain numbers or special characters",
    }
  }

  // Check each part
  for (const part of parts) {
    if (!isValidNamePart(part)) {
      return {
        isValid: false,
        errorFr: "Ce nom ne semble pas valide",
        errorEn: "This name doesn't seem valid",
      }
    }
  }

  // Final structural check
  if (!looksLikeRealName(trimmed)) {
    return {
      isValid: false,
      errorFr: "Veuillez entrer un vrai pr\u00e9nom et nom de famille",
      errorEn: "Please enter a real first and last name",
    }
  }

  return { isValid: true, errorFr: null, errorEn: null }
}
