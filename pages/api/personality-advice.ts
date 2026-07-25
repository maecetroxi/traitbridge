import type { NextApiRequest, NextApiResponse } from "next";
import OpenAI from "openai";
import {
  isPersonalityAdviceResponse,
  PERSONALITY_ADVICE_SCHEMA,
  type PersonalityAdviceResponse,
  validatePersonalityAdviceRequest,
} from "../../lib/personality-guide";

type ErrorResponse = {
  code:
    | "method_not_allowed"
    | "invalid_request"
    | "rate_limited"
    | "configuration_error"
    | "provider_error"
    | "invalid_response";
};

type RateLimitEntry = {
  count: number;
  resetAt: number;
};

const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;
const RATE_LIMIT_MAX_REQUESTS = 8;
const rateLimits = new Map<string, RateLimitEntry>();

const getClientIp = (request: NextApiRequest) => {
  const forwardedFor = request.headers["x-forwarded-for"];
  const rawIp = Array.isArray(forwardedFor) ? forwardedFor[0] : forwardedFor?.split(",")[0];
  return rawIp?.trim() || request.socket.remoteAddress || "unknown";
};

const consumeRateLimit = (key: string) => {
  const now = Date.now();
  const current = rateLimits.get(key);

  if (!current || current.resetAt <= now) {
    rateLimits.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }

  if (current.count >= RATE_LIMIT_MAX_REQUESTS) {
    return false;
  }

  current.count += 1;
  return true;
};

const getSystemInstructions = (language: "de" | "en") => {
  const languageInstruction = language === "de" ? "Antworte ausschließlich auf Deutsch." : "Answer only in English.";

  return `${languageInstruction}
You provide concise, practical reflection prompts based on Big Five tendencies. O is openness, C conscientiousness, E extraversion, A agreeableness, and N emotional sensitivity/neuroticism. A high N means greater emotional sensitivity, not greater stability.
Treat scores as tendencies, never as diagnoses, fixed identities, predictions, or proof of ability. Do not make medical or therapeutic claims. If the question asks for diagnosis, crisis help, or treatment, clearly recommend appropriate professional support.
Return one direct summary and exactly three short, actionable insights. Keep the complete answer around 80 to 120 words. The disclaimer must briefly state that the answer is an orientation aid and not a psychological diagnosis.`;
};

const handler = async (
  request: NextApiRequest,
  response: NextApiResponse<PersonalityAdviceResponse | ErrorResponse>,
) => {
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    response.status(405).json({ code: "method_not_allowed" });
    return;
  }

  const openAiApiKey = process.env.OPENAI_API_KEY;

  if (!openAiApiKey) {
    response.status(503).json({ code: "configuration_error" });
    return;
  }

  if (!consumeRateLimit(getClientIp(request))) {
    response.status(429).json({ code: "rate_limited" });
    return;
  }

  const validation = validatePersonalityAdviceRequest(request.body);

  if (!validation.valid) {
    response.status(400).json({ code: validation.code });
    return;
  }

  const { question, language, scores } = validation.data;
  const openai = new OpenAI({ apiKey: openAiApiKey });

  try {
    const aiResponse = await openai.responses.create({
      model: process.env.OPENAI_MODEL || "gpt-4.1-mini",
      store: false,
      instructions: getSystemInstructions(language),
      input: `Big Five scores (1-5): O=${scores.O}, C=${scores.C}, E=${scores.E}, A=${scores.A}, N=${scores.N}.\nQuestion: ${question}`,
      text: {
        format: {
          type: "json_schema",
          name: "personality_advice",
          strict: true,
          schema: PERSONALITY_ADVICE_SCHEMA,
        },
      },
    });

    if (!aiResponse.output_text) {
      response.status(502).json({ code: "invalid_response" });
      return;
    }

    let parsedResponse: unknown;

    try {
      parsedResponse = JSON.parse(aiResponse.output_text);
    } catch {
      response.status(502).json({ code: "invalid_response" });
      return;
    }

    if (!isPersonalityAdviceResponse(parsedResponse)) {
      response.status(502).json({ code: "invalid_response" });
      return;
    }

    response.status(200).json(parsedResponse);
  } catch (error) {
    if (error instanceof OpenAI.RateLimitError) {
      response.status(429).json({ code: "rate_limited" });
      return;
    }

    if (
      error instanceof OpenAI.AuthenticationError ||
      error instanceof OpenAI.PermissionDeniedError ||
      error instanceof OpenAI.NotFoundError
    ) {
      response.status(503).json({ code: "configuration_error" });
      return;
    }

    response.status(502).json({ code: "provider_error" });
  }
};

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "10kb",
    },
  },
};

export default handler;
