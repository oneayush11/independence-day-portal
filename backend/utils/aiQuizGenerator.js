/**
 * AI-based Quiz Generator
 * -------------------------------------------------------
 * If ANTHROPIC_API_KEY is set in backend/.env, this calls the Anthropic API
 * (Claude) to generate MCQ questions based on the given topic.
 *
 * If no API key is set (or the API call fails), it automatically falls back
 * to a LOCAL, template-based generator so the project keeps working without
 * needing an API key.
 */

// Multiple local question banks so different topics don't all show the
// exact same set of questions. Each bank is matched against keywords found
// in the topic the admin typed in.
const FALLBACK_BANKS = {
  independenceMovement: {
    keywords: ["independence", "freedom struggle", "azadi", "movement", "history", "1947"],
    questions: [
      {
        questionText: "On which day did India gain independence?",
        options: ["26 January 1950", "15 August 1947", "2 October 1869", "30 January 1948"],
        correctIndex: 1,
      },
      {
        questionText: "Who was India's first Prime Minister?",
        options: ["Mahatma Gandhi", "Sardar Patel", "Jawaharlal Nehru", "Dr. Rajendra Prasad"],
        correctIndex: 2,
      },
      {
        questionText: "In which year did the Quit India Movement begin?",
        options: ["1942", "1930", "1919", "1947"],
        correctIndex: 0,
      },
      {
        questionText: "Who led the Dandi March (Salt March)?",
        options: ["Bhagat Singh", "Subhas Chandra Bose", "Mahatma Gandhi", "Lal Bahadur Shastri"],
        correctIndex: 2,
      },
      {
        questionText: "What was the slogan of the Quit India Movement?",
        options: ["Inquilab Zindabad", "Do or Die", "Satyamev Jayate", "Vande Mataram"],
        correctIndex: 1,
      },
      {
        questionText: "In which year was the Indian National Congress (INC) founded?",
        options: ["1885", "1905", "1919", "1930"],
        correctIndex: 0,
      },
    ],
  },

  freedomFighters: {
    keywords: ["freedom fighter", "fighters", "leaders", "netaji", "gandhi", "bose", "patel"],
    questions: [
      {
        questionText: "Who gave the famous slogan 'Jai Hind'?",
        options: ["Mahatma Gandhi", "Subhas Chandra Bose", "Bhagat Singh", "Jawaharlal Nehru"],
        correctIndex: 1,
      },
      {
        questionText: "Who founded the Indian National Army (Azad Hind Fauj)?",
        options: ["Subhas Chandra Bose", "Chandrashekhar Azad", "Bhagat Singh", "Sardar Patel"],
        correctIndex: 0,
      },
      {
        questionText: "Sardar Vallabhbhai Patel is known as the 'Iron Man of India' for uniting what?",
        options: ["India's states", "India's armies", "India's railways", "India's political parties"],
        correctIndex: 0,
      },
      {
        questionText: "Which freedom fighter was hanged by the British at the age of 23?",
        options: ["Chandrashekhar Azad", "Bhagat Singh", "Khudiram Bose", "Ram Prasad Bismil"],
        correctIndex: 1,
      },
      {
        questionText: "Who wrote India's national song 'Vande Mataram'?",
        options: ["Rabindranath Tagore", "Bankim Chandra Chattopadhyay", "Sarojini Naidu", "Muhammad Iqbal"],
        correctIndex: 1,
      },
      {
        questionText: "Who was known as the 'Nightingale of India'?",
        options: ["Sarojini Naidu", "Kasturba Gandhi", "Annie Besant", "Vijaya Lakshmi Pandit"],
        correctIndex: 0,
      },
    ],
  },

  nationalSymbols: {
    keywords: ["flag", "anthem", "symbol", "emblem", "chakra", "tiranga", "national"],
    questions: [
      {
        questionText: "How many colours are there in the Indian national flag?",
        options: ["2", "3", "4", "5"],
        correctIndex: 1,
      },
      {
        questionText: "On which day was the Indian national flag adopted?",
        options: ["15 August 1947", "22 July 1947", "26 January 1950", "2 October 1947"],
        correctIndex: 1,
      },
      {
        questionText: "Who wrote India's national anthem 'Jana Gana Mana'?",
        options: ["Rabindranath Tagore", "Bankim Chandra Chattopadhyay", "Sarojini Naidu", "Iqbal"],
        correctIndex: 0,
      },
      {
        questionText: "How many spokes does the Ashoka Chakra on the Indian flag have?",
        options: ["16", "20", "24", "32"],
        correctIndex: 2,
      },
      {
        questionText: "What is the national emblem of India adapted from?",
        options: [
          "Ashoka's Lion Capital of Sarnath",
          "The Red Fort",
          "The Taj Mahal",
          "The Konark Sun Temple",
        ],
        correctIndex: 0,
      },
      {
        questionText: "What is written below the national emblem of India?",
        options: ["Jai Hind", "Satyameva Jayate", "Vande Mataram", "Ekta Mein Bal Hai"],
        correctIndex: 1,
      },
    ],
  },

  constitutionAndGovernment: {
    keywords: ["constitution", "republic", "government", "president", "democracy", "parliament"],
    questions: [
      {
        questionText: "On which day did the Constitution of India come into effect?",
        options: ["15 August 1947", "26 January 1950", "26 November 1949", "2 October 1950"],
        correctIndex: 1,
      },
      {
        questionText: "Who is known as the 'Father of the Indian Constitution'?",
        options: ["Mahatma Gandhi", "Dr. B. R. Ambedkar", "Jawaharlal Nehru", "Sardar Patel"],
        correctIndex: 1,
      },
      {
        questionText: "Who was the first President of India?",
        options: ["Jawaharlal Nehru", "Dr. Rajendra Prasad", "Dr. S. Radhakrishnan", "Zakir Husain"],
        correctIndex: 1,
      },
      {
        questionText: "India is often called the world's largest what?",
        options: ["Economy", "Democracy", "Monarchy", "Republic of states"],
        correctIndex: 1,
      },
      {
        questionText: "How many fundamental duties are listed in the Indian Constitution?",
        options: ["8", "10", "11", "12"],
        correctIndex: 2,
      },
    ],
  },

  generalKnowledge: {
    // Used when the topic doesn't match any of the categories above.
    keywords: [],
    questions: [
      {
        questionText: "What is the national fruit of India?",
        options: ["Banana", "Mango", "Apple", "Papaya"],
        correctIndex: 1,
      },
      {
        questionText: "What is the national animal of India?",
        options: ["Lion", "Elephant", "Bengal Tiger", "Leopard"],
        correctIndex: 2,
      },
      {
        questionText: "What is the national bird of India?",
        options: ["Peacock", "Parrot", "Sparrow", "Crow"],
        correctIndex: 0,
      },
      {
        questionText: "Which river is considered the longest in India?",
        options: ["Yamuna", "Godavari", "Ganga", "Brahmaputra"],
        correctIndex: 2,
      },
      {
        questionText: "How many states does India currently have?",
        options: ["27", "28", "29", "30"],
        correctIndex: 1,
      },
      {
        questionText: "Which is the largest state in India by area?",
        options: ["Madhya Pradesh", "Maharashtra", "Rajasthan", "Uttar Pradesh"],
        correctIndex: 2,
      },
    ],
  },
};

// The only topics selectable in the admin dropdown. Keeping this list in one
// place (and validating against it on the server) means an admin can never
// submit a random/off-list topic — only these 4 are ever accepted.
const ALLOWED_TOPICS = [
  "Indian Independence Movement",
  "Indian Freedom Fighters",
  "National Symbols of India",
  "Constitution & Government of India",
];

function normalizeTopic(topic) {
  return (topic || "").trim().toLowerCase();
}

// Simple deterministic hash so the same "unrecognized" topic always maps to
// the same bank, while different topics are likely to land on different banks.
function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 31 + str.charCodeAt(i)) >>> 0;
  }
  return hash;
}

function pickBank(topic) {
  const key = normalizeTopic(topic);
  const bankNames = Object.keys(FALLBACK_BANKS);

  // Try to match by keyword first (skips "generalKnowledge", which has none)
  for (const bankName of bankNames) {
    const { keywords } = FALLBACK_BANKS[bankName];
    if (keywords.some((kw) => key.includes(kw))) {
      return FALLBACK_BANKS[bankName];
    }
  }

  // No keyword match (e.g. an unrelated topic like "java" or "cricket") —
  // deterministically pick one of the banks based on the topic text itself,
  // so different topics tend to produce different-looking quizzes instead
  // of always falling back to the same one.
  const candidates = bankNames.filter((b) => b !== "generalKnowledge");
  const index = hashString(key || "default") % candidates.length;
  return FALLBACK_BANKS[candidates[index]];
}

function localGenerate(topic, count) {
  const bank = pickBank(topic).questions;
  const questions = [];
  for (let i = 0; i < count; i++) {
    questions.push(bank[i % bank.length]);
  }
  return questions;
}

async function generateQuizQuestions({ topic, count = 5 }) {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    return { questions: localGenerate(topic, count), source: "local" };
  }

  try {
    const prompt = `Generate ${count} multiple choice quiz questions about the topic: "${topic}" 
related to Indian Independence Day / Indian freedom struggle / patriotism (keep it India-focused, factually correct, and school/college appropriate). Write all questions and options in English.
Respond ONLY with a valid JSON array, no markdown fences, no preamble. Each item must be exactly in this shape:
[{"questionText": "string", "options": ["a","b","c","d"], "correctIndex": 0}]
correctIndex must be a 0-based index into options pointing to the correct answer.`;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 1500,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!response.ok) {
      throw new Error(`Anthropic API responded with status ${response.status}`);
    }

    const data = await response.json();
    const text = (data.content || [])
      .map((block) => block.text || "")
      .join("")
      .trim();

    const cleaned = text.replace(/```json/g, "").replace(/```/g, "").trim();
    const parsed = JSON.parse(cleaned);

    const valid = parsed.filter(
      (q) =>
        q &&
        typeof q.questionText === "string" &&
        Array.isArray(q.options) &&
        q.options.length === 4 &&
        Number.isInteger(q.correctIndex) &&
        q.correctIndex >= 0 &&
        q.correctIndex <= 3
    );

    if (valid.length === 0) throw new Error("AI response had no valid questions");

    return { questions: valid.slice(0, count), source: "ai" };
  } catch (err) {
    console.warn("⚠️  AI quiz generation failed, using local fallback:", err.message);
    return { questions: localGenerate(topic, count), source: "local" };
  }
}

module.exports = { generateQuizQuestions, ALLOWED_TOPICS };