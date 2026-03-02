import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import path from "path";
import { env } from "./config/env";
import {
  type PublicArticle,
  createArticle,
  deleteArticle,
  favoriteArticle,
  getArticleRecordBySlug,
  getPublicArticleBySlug,
  isArticleAuthor,
  listArticles,
  unfavoriteArticle,
  updateArticle,
} from "./data/articles";
import {
  User,
  createUser,
  findUserByEmail,
  findUserById,
  findUserByUsername,
  updateUser,
} from "./data/users";

const app = express();
const PORT = env.PORT;
const JWT_SECRET = env.JWT_SECRET;
const JWT_EXPIRES_IN = "7d";
const PUBLIC_BASE_URL = env.PUBLIC_BASE_URL;
const isProduction = env.isProduction;
const configuredOrigins = env.CORS_ORIGINS;
const developmentOrigins = ["http://localhost:3000", "http://localhost:5173"];
const allowedOrigins = Array.from(
  new Set([
    ...configuredOrigins,
    ...(isProduction ? [] : developmentOrigins),
  ])
);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }
      const corsError = new Error("Not allowed by CORS") as Error & {
        status?: number;
      };
      corsError.status = 403;
      callback(corsError);
    },
    credentials: false,
  })
);

app.use(express.json());
app.use(
  "/images",
  express.static(path.join(__dirname, "..", "public", "images"))
);

type JwtPayload = {
  userId: number;
  email: string;
};

type UserResponse = {
  user: {
    email: string;
    token: string;
    username: string;
    bio: string;
    image: string | null;
  };
};

const createToken = (user: User): string =>
  jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });

const getRequestBaseUrl = (): string => PUBLIC_BASE_URL;

const toPublicUrl = (req: Request, value: string | null): string | null => {
  if (!value) {
    return value;
  }

  if (/^https?:\/\//i.test(value)) {
    return value;
  }

  const normalizedPath = value.startsWith("/") ? value : `/${value}`;
  return `${getRequestBaseUrl()}${normalizedPath}`;
};

const serializeArticle = (req: Request, article: PublicArticle): PublicArticle => ({
  ...article,
  author: {
    ...article.author,
    image: toPublicUrl(req, article.author.image),
  },
});

const toUserResponse = (req: Request, user: User): UserResponse => ({
  user: {
    email: user.email,
    token: createToken(user),
    username: user.username,
    bio: user.bio,
    image: toPublicUrl(req, user.image),
  },
});

const extractToken = (req: Request): string | null => {
  const authHeader = req.header("authorization");
  if (!authHeader) {
    return null;
  }

  const [scheme, token] = authHeader.split(" ");
  if (!token) {
    return null;
  }

  const normalized = scheme.toLowerCase();
  if (normalized !== "token" && normalized !== "bearer") {
    return null;
  }

  return token.trim();
};

const getOptionalUserFromRequest = (req: Request): User | undefined => {
  const token = extractToken(req);
  if (!token) {
    return undefined;
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET) as JwtPayload;
    return findUserById(payload.userId);
  } catch {
    return undefined;
  }
};

const getRequiredUserFromRequest = (
  req: Request,
  res: Response
): User | undefined => {
  const token = extractToken(req);
  if (!token) {
    res.status(401).json({ errors: { body: ["Authorization token is required"] } });
    return undefined;
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET) as JwtPayload;
    const user = findUserById(payload.userId);
    if (!user) {
      res.status(401).json({ errors: { body: ["Invalid token"] } });
      return undefined;
    }
    return user;
  } catch {
    res.status(401).json({ errors: { body: ["Invalid token"] } });
    return undefined;
  }
};

const sanitizeTagList = (value: unknown): string[] => {
  if (!Array.isArray(value)) {
    return [];
  }
  return value
    .filter((tag): tag is string => typeof tag === "string")
    .map((tag) => tag.trim())
    .filter(Boolean);
};

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

app.post("/api/users", async (req, res) => {
  const payload = (req.body ?? {}) as {
    user?: { username?: string; email?: string; password?: string };
  };

  const username = payload.user?.username?.trim();
  const email = payload.user?.email?.trim().toLowerCase();
  const password = payload.user?.password;

  const errors: Record<string, string[]> = {};

  if (!username) {
    errors.username = ["can't be blank"];
  } else if (username.length < 3 || username.length > 20) {
    errors.username = ["must be between 3 and 20 characters"];
  }

  if (!email) {
    errors.email = ["can't be blank"];
  } else if (!/^\S+@\S+\.\S+$/.test(email)) {
    errors.email = ["is invalid"];
  }

  if (!password) {
    errors.password = ["can't be blank"];
  } else if (password.length < 6) {
    errors.password = ["is too short (minimum is 6 characters)"];
  }

  if (email && findUserByEmail(email)) {
    errors.email = ["has already been taken"];
  }
  if (username && findUserByUsername(username)) {
    errors.username = ["has already been taken"];
  }

  if (Object.keys(errors).length > 0) {
    res.status(422).json({ errors });
    return;
  }

  const passwordHash = await bcrypt.hash(password!, 10);
  const user = createUser(username!, email!, passwordHash);
  res.status(200).json(toUserResponse(req, user));
});

app.post("/api/users/login", async (req, res) => {
  const payload = (req.body ?? {}) as { user?: { email?: string; password?: string } };

  const email = payload.user?.email?.trim().toLowerCase();
  const password = payload.user?.password;

  if (!email || !password) {
    res.status(422).json({ errors: { "email or password": ["can't be blank"] } });
    return;
  }

  const user = findUserByEmail(email);
  if (!user) {
    res.status(422).json({ errors: { "email or password": ["is invalid"] } });
    return;
  }

  const isValidPassword = await bcrypt.compare(password, user.passwordHash);
  if (!isValidPassword) {
    res.status(422).json({ errors: { "email or password": ["is invalid"] } });
    return;
  }

  res.status(200).json(toUserResponse(req, user));
});

app.put("/api/user", async (req, res) => {
  const currentUser = getRequiredUserFromRequest(req, res);
  if (!currentUser) {
    return;
  }

  const payload = (req.body ?? {}) as {
    user?: {
      username?: string;
      email?: string;
      password?: string;
      bio?: string;
      image?: string | null;
    };
  };

  const nextUsername = payload.user?.username?.trim();
  const nextEmail = payload.user?.email?.trim().toLowerCase();
  const nextPassword = payload.user?.password;

  const errors: Record<string, string[]> = {};

  if (nextUsername) {
    const existingByUsername = findUserByUsername(nextUsername);
    if (existingByUsername && existingByUsername.id !== currentUser.id) {
      errors.username = ["has already been taken"];
    }
  }

  if (nextEmail) {
    if (!/^\S+@\S+\.\S+$/.test(nextEmail)) {
      errors.email = ["is invalid"];
    } else {
      const existingByEmail = findUserByEmail(nextEmail);
      if (existingByEmail && existingByEmail.id !== currentUser.id) {
        errors.email = ["has already been taken"];
      }
    }
  }

  if (typeof nextPassword === "string" && nextPassword.length > 0 && nextPassword.length < 6) {
    errors.password = ["is too short (minimum is 6 characters)"];
  }

  if (Object.keys(errors).length > 0) {
    res.status(422).json({ errors });
    return;
  }

  const passwordHash =
    typeof nextPassword === "string" && nextPassword.length > 0
      ? await bcrypt.hash(nextPassword, 10)
      : undefined;

  const updatedUser = updateUser(currentUser.id, {
    username: nextUsername || undefined,
    email: nextEmail || undefined,
    bio: typeof payload.user?.bio === "string" ? payload.user.bio : undefined,
    image:
      payload.user && "image" in payload.user
        ? payload.user.image ?? null
        : undefined,
    passwordHash,
  });

  if (!updatedUser) {
    res.status(404).json({ errors: { body: ["User not found"] } });
    return;
  }

  res.status(200).json(toUserResponse(req, updatedUser));
});

app.get("/api/articles", (req, res) => {
  const viewer = getOptionalUserFromRequest(req) ?? findUserById(1);

  const limit = Number(req.query.limit) > 0 ? Number(req.query.limit) : 5;
  const offset = Number(req.query.offset) >= 0 ? Number(req.query.offset) : 0;

  const articlesResponse = listArticles(limit, offset, viewer?.id);

  res.json({
    ...articlesResponse,
    articles: articlesResponse.articles.map((article) => serializeArticle(req, article)),
  });
});

app.get("/api/articles/:slug", (req, res) => {
  const viewer = getOptionalUserFromRequest(req) ?? findUserById(1);
  const article = getPublicArticleBySlug(req.params.slug, viewer?.id);

  if (!article) {
    res.status(404).json({ errors: { body: ["Article not found"] } });
    return;
  }

  res.json({ article: serializeArticle(req, article) });
});

app.post("/api/articles", (req, res) => {
  const currentUser = getRequiredUserFromRequest(req, res);
  if (!currentUser) {
    return;
  }

  const payload = (req.body ?? {}) as {
    article?: {
      title?: string;
      description?: string;
      body?: string;
      tagList?: unknown;
    };
  };

  const title = payload.article?.title?.trim();
  const description = payload.article?.description?.trim();
  const body = payload.article?.body?.trim();

  const bodyErrors: string[] = [];
  if (!title) {
    bodyErrors.push("Title can't be blank");
  }
  if (!description) {
    bodyErrors.push("Description can't be blank");
  }
  if (!body) {
    bodyErrors.push("Body can't be blank");
  }

  if (bodyErrors.length > 0) {
    res.status(422).json({ errors: { body: bodyErrors } });
    return;
  }

  const article = createArticle(
    currentUser.id,
    {
      title: title!,
      description: description!,
      body: body!,
      tagList: sanitizeTagList(payload.article?.tagList),
    },
    currentUser.id
  );

  res.status(200).json({ article: serializeArticle(req, article) });
});

app.put("/api/articles/:slug", (req, res) => {
  const currentUser = getRequiredUserFromRequest(req, res);
  if (!currentUser) {
    return;
  }

  const slug = req.params.slug;
  if (!getArticleRecordBySlug(slug)) {
    res.status(404).json({ errors: { body: ["Article not found"] } });
    return;
  }

  if (!isArticleAuthor(slug, currentUser.id)) {
    res
      .status(403)
      .json({ errors: { body: ["You are not the author of this article"] } });
    return;
  }

  const payload = (req.body ?? {}) as {
    article?: {
      title?: string;
      description?: string;
      body?: string;
      tagList?: unknown;
    };
  };

  const updated = updateArticle(
    slug,
    {
      title: payload.article?.title,
      description: payload.article?.description,
      body: payload.article?.body,
      tagList: Array.isArray(payload.article?.tagList)
        ? sanitizeTagList(payload.article?.tagList)
        : undefined,
    },
    currentUser.id
  );

  if (!updated) {
    res.status(404).json({ errors: { body: ["Article not found"] } });
    return;
  }

  res.status(200).json({ article: serializeArticle(req, updated) });
});

app.delete("/api/articles/:slug", (req, res) => {
  const currentUser = getRequiredUserFromRequest(req, res);
  if (!currentUser) {
    return;
  }

  const slug = req.params.slug;
  if (!getArticleRecordBySlug(slug)) {
    res.status(404).json({ errors: { body: ["Article not found"] } });
    return;
  }

  if (!isArticleAuthor(slug, currentUser.id)) {
    res
      .status(403)
      .json({ errors: { body: ["You are not the author of this article"] } });
    return;
  }

  deleteArticle(slug);
  res.status(204).send();
});

app.post("/api/articles/:slug/favorite", (req, res) => {
  const currentUser = getOptionalUserFromRequest(req) ?? findUserById(1);
  if (!currentUser) {
    res.status(401).json({ errors: { body: ["Authorization token is required"] } });
    return;
  }

  const article = favoriteArticle(req.params.slug, currentUser.id);
  if (!article) {
    res.status(404).json({ errors: { body: ["Article not found"] } });
    return;
  }

  res.status(200).json({ article: serializeArticle(req, article) });
});

app.delete("/api/articles/:slug/favorite", (req, res) => {
  const currentUser = getOptionalUserFromRequest(req) ?? findUserById(1);
  if (!currentUser) {
    res.status(401).json({ errors: { body: ["Authorization token is required"] } });
    return;
  }

  const article = unfavoriteArticle(req.params.slug, currentUser.id);
  if (!article) {
    res.status(404).json({ errors: { body: ["Article not found"] } });
    return;
  }

  res.status(200).json({ article: serializeArticle(req, article) });
});

app.use((_req, res) => {
  res.status(404).json({ errors: { body: ["Not Found"] } });
});

app.use(
  (
    error: Error & { status?: number; statusCode?: number; type?: string },
    _req: Request,
    res: Response,
    next: NextFunction
  ) => {
    if (res.headersSent) {
      next(error);
      return;
    }

    console.error(error);

    if (error.type === "entity.parse.failed") {
      res.status(400).json({ errors: { body: ["Invalid JSON payload"] } });
      return;
    }

    const status = error.statusCode ?? error.status ?? 500;
    const message =
      status >= 500 ? "Internal Server Error" : error.message || "Unexpected error";

    res.status(status).json({ errors: { body: [message] } });
  }
);

app.listen(PORT, () => {
  console.log(`Blog API started on port ${PORT}`);
});
