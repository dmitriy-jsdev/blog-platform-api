import bcrypt from "bcryptjs";
import { env } from "../config/env";

const DEFAULT_AVATAR_PATH = "/images/avatars/default-avatar.png";
const DMITRY_AVATAR_PATH = "/images/avatars/dmitry-avatar.jpg";

export interface User {
  id: number;
  username: string;
  email: string;
  bio: string;
  image: string | null;
  passwordHash: string;
}

const defaultAuthorUser: User = {
  id: 1,
  username: "Dmitry",
  email: "111@mail.ru",
  bio: "Люблю писать простые и полезные статьи.",
  image: DMITRY_AVATAR_PATH,
  passwordHash: bcrypt.hashSync("111111", 10),
};

const additionalDemoUsers: User[] = [
  {
    id: 2,
    username: "Olga",
    email: "olga@mail.ru",
    bio: "Читаю блог перед завтраком.",
    image: "https://api.dicebear.com/9.x/initials/svg?seed=Olga",
    passwordHash: bcrypt.hashSync("111111", 10),
  },
  {
    id: 3,
    username: "Max",
    email: "max@mail.ru",
    bio: "Собираю полезные заметки.",
    image: "https://api.dicebear.com/9.x/initials/svg?seed=Max",
    passwordHash: bcrypt.hashSync("111111", 10),
  },
  {
    id: 4,
    username: "Nina",
    email: "nina@mail.ru",
    bio: "Люблю тексты с юмором.",
    image: "https://api.dicebear.com/9.x/initials/svg?seed=Nina",
    passwordHash: bcrypt.hashSync("111111", 10),
  },
  {
    id: 5,
    username: "Pavel",
    email: "pavel@mail.ru",
    bio: "Ставлю лайки за хорошие мысли.",
    image: "https://api.dicebear.com/9.x/initials/svg?seed=Pavel",
    passwordHash: bcrypt.hashSync("111111", 10),
  },
  {
    id: 6,
    username: "Katya",
    email: "katya@mail.ru",
    bio: "Читаю по пути на работу.",
    image: "https://api.dicebear.com/9.x/initials/svg?seed=Katya",
    passwordHash: bcrypt.hashSync("111111", 10),
  },
  {
    id: 7,
    username: "Ilya",
    email: "ilya@mail.ru",
    bio: "Люблю короткие и ясные статьи.",
    image: "https://api.dicebear.com/9.x/initials/svg?seed=Ilya",
    passwordHash: bcrypt.hashSync("111111", 10),
  },
  {
    id: 8,
    username: "Sasha",
    email: "sasha@mail.ru",
    bio: "Иногда спорю с внутренним критиком.",
    image: "https://api.dicebear.com/9.x/initials/svg?seed=Sasha",
    passwordHash: bcrypt.hashSync("111111", 10),
  },
  {
    id: 9,
    username: "Mira",
    email: "mira@mail.ru",
    bio: "Сохраняю идеи для выходных.",
    image: "https://api.dicebear.com/9.x/initials/svg?seed=Mira",
    passwordHash: bcrypt.hashSync("111111", 10),
  },
  {
    id: 10,
    username: "Artem",
    email: "artem@mail.ru",
    bio: "Читаю про привычки и отдых.",
    image: "https://api.dicebear.com/9.x/initials/svg?seed=Artem",
    passwordHash: bcrypt.hashSync("111111", 10),
  },
  {
    id: 11,
    username: "Lena",
    email: "lena@mail.ru",
    bio: "Люблю легкие тексты про жизнь.",
    image: "https://api.dicebear.com/9.x/initials/svg?seed=Lena",
    passwordHash: bcrypt.hashSync("111111", 10),
  },
  {
    id: 12,
    username: "Roman",
    email: "roman@mail.ru",
    bio: "Собираю идеи для постов.",
    image: "https://api.dicebear.com/9.x/initials/svg?seed=Roman",
    passwordHash: bcrypt.hashSync("111111", 10),
  },
  {
    id: 13,
    username: "Vera",
    email: "vera@mail.ru",
    bio: "Лайк за улыбку в тексте.",
    image: "https://api.dicebear.com/9.x/initials/svg?seed=Vera",
    passwordHash: bcrypt.hashSync("111111", 10),
  },
  {
    id: 14,
    username: "Timur",
    email: "timur@mail.ru",
    bio: "Читаю в обеденный перерыв.",
    image: "https://api.dicebear.com/9.x/initials/svg?seed=Timur",
    passwordHash: bcrypt.hashSync("111111", 10),
  },
  {
    id: 15,
    username: "Alina",
    email: "alina@mail.ru",
    bio: "Обожаю заметки про настроение.",
    image: "https://api.dicebear.com/9.x/initials/svg?seed=Alina",
    passwordHash: bcrypt.hashSync("111111", 10),
  },
];

const users: User[] = env.SEED_DEMO_USERS
  ? [defaultAuthorUser, ...additionalDemoUsers]
  : [defaultAuthorUser];

let nextUserId = users.length + 1;

export const findUserById = (id: number): User | undefined =>
  users.find((user) => user.id === id);

export const findUserByEmail = (email: string): User | undefined =>
  users.find((user) => user.email.toLowerCase() === email.toLowerCase());

export const findUserByUsername = (username: string): User | undefined =>
  users.find((user) => user.username.toLowerCase() === username.toLowerCase());

export const getAllUserIds = (): number[] => users.map((user) => user.id);

export const createUser = (
  username: string,
  email: string,
  passwordHash: string,
): User => {
  const user: User = {
    id: nextUserId++,
    username,
    email,
    bio: "I'm a programmer",
    image: DEFAULT_AVATAR_PATH,
    passwordHash,
  };

  users.push(user);
  return user;
};

type UpdateUserPayload = {
  username?: string;
  email?: string;
  bio?: string;
  image?: string | null;
  passwordHash?: string;
};

export const updateUser = (
  userId: number,
  payload: UpdateUserPayload,
): User | undefined => {
  const user = findUserById(userId);
  if (!user) {
    return undefined;
  }

  if (typeof payload.username === "string") {
    user.username = payload.username;
  }
  if (typeof payload.email === "string") {
    user.email = payload.email;
  }
  if (typeof payload.bio === "string") {
    user.bio = payload.bio;
  }
  if (payload.image !== undefined) {
    user.image = payload.image;
  }
  if (typeof payload.passwordHash === "string") {
    user.passwordHash = payload.passwordHash;
  }

  return user;
};
