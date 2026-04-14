/**
 * Seed de usuarios desde ReqRes
 * Este script crea usuarios en la base de datos a partir de la API de ReqRes
 * 
 * NOTA: Este script requiere que REQRES_BASE_URL esté configurado en el archivo .env
 * IMPORTANTE: Este script no crea posts ni comentarios, solo usuarios
 * 
 * @author Ivan Camilo
 */

/// <reference types="node" />

import axios from 'axios';
import { PrismaClient, Role } from '@prisma/client';

const prisma = new PrismaClient();

type ReqresUser = {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  avatar: string;
};

const fallbackReqresUsers: Record<number, ReqresUser> = {
  1: {
    id: 1,
    email: 'george.bluth@reqres.in',
    first_name: 'George',
    last_name: 'Bluth',
    avatar: 'https://reqres.in/img/faces/1-image.jpg',
  },
  2: {
    id: 2,
    email: 'janet.weaver@reqres.in',
    first_name: 'Janet',
    last_name: 'Weaver',
    avatar: 'https://reqres.in/img/faces/2-image.jpg',
  },
  3: {
    id: 3,
    email: 'emma.wong@reqres.in',
    first_name: 'Emma',
    last_name: 'Wong',
    avatar: 'https://reqres.in/img/faces/3-image.jpg',
  },
};

async function fetchReqresUser(id: number): Promise<ReqresUser> {
  const baseUrl = process.env.REQRES_BASE_URL;
  if (!baseUrl) {
    throw new Error('REQRES_BASE_URL is required to run prisma seed');
  }

  const normalizedBaseUrl = baseUrl.replace(/\/$/, '');
  const url = `${normalizedBaseUrl}/users/${id}`;
  const timeoutMs = Number(process.env.REQRES_TIMEOUT_MS ?? 5000);

  try {
    const res = await axios.get<{ data: ReqresUser }>(url, {
      timeout: timeoutMs,
    });
    return res.data.data;
  } catch (e) {
    if (axios.isAxiosError(e)) {
      const status = e.response?.status;

      const fallback = fallbackReqresUsers[id];
      if (fallback && (status === 401 || status === 403 || status === undefined)) {
        process.stderr.write(
          `ReqRes fetch failed for user ${id} (url=${url}, status=${status ?? 'unknown'}). Falling back to embedded seed user.\n`,
        );
        return fallback;
      }

      const hint =
        status === 401
          ? `\nHint: 401 usually means REQRES_BASE_URL is pointing to a protected API (e.g. your own backend). Set REQRES_BASE_URL=https://reqres.in/api`
          : '';
      throw new Error(
        `Failed to fetch ReqRes user ${id}. url=${url} status=${status ?? 'unknown'}${hint}`,
      );
    }
    throw e;
  }
}

async function upsertUserFromReqres(id: number, role: Role) {
  const u = await fetchReqresUser(id);
  return prisma.user.upsert({
    where: { id: u.id },
    update: {
      email: u.email,
      firstName: u.first_name,
      lastName: u.last_name,
      avatar: u.avatar,
      role,
    },
    create: {
      id: u.id,
      email: u.email,
      firstName: u.first_name,
      lastName: u.last_name,
      avatar: u.avatar,
      role,
    },
  });
}

async function upsertSeedPost(params: {
  id: string;
  title: string;
  body: string;
  authorUserId: number;
}) {
  return prisma.post.upsert({
    where: { id: params.id },
    update: {
      title: params.title,
      body: params.body,
      authorUserId: params.authorUserId,
    },
    create: {
      id: params.id,
      title: params.title,
      body: params.body,
      authorUserId: params.authorUserId,
    },
  });
}

async function main() {
  const users = await Promise.all([
    upsertUserFromReqres(1, Role.ADMIN),
    upsertUserFromReqres(2, Role.VIEWER),
    upsertUserFromReqres(3, Role.VIEWER),
  ]);

  const byId = new Map(users.map((u) => [u.id, u] as const));

  await Promise.all([
    upsertSeedPost({
      id: '0b755a41-0a98-4c37-a5c2-3fbb7a8d1b21',
      title: 'Seed: First steps with request tracing',
      body: 'This post exists to make the portal feel alive on first run. Every API call should carry an X-Request-ID end-to-end.',
      authorUserId: byId.get(1)!.id,
    }),
    upsertSeedPost({
      id: 'b3b7d2a0-9c6a-4e6a-b694-7c7db2e81c6a',
      title: 'Seed: RBAC quick check',
      body: 'Log in as admin to see Delete actions. Log in as viewer to confirm the UI hides destructive operations.',
      authorUserId: byId.get(1)!.id,
    }),
    upsertSeedPost({
      id: '1f2b62be-6e9c-4bb3-8a06-0a45b0f2f1b4',
      title: 'Seed: Editorial note',
      body: 'Good UX in admin portals is about fast scanning, clear states, and safe defaults. This seed helps reviewers test flows quickly.',
      authorUserId: byId.get(2)!.id,
    }),
    upsertSeedPost({
      id: '5d2d8d31-6a70-4f1e-83d6-39f1f8e1f42d',
      title: 'Seed: Post CRUD ready',
      body: 'You can now navigate to /posts, open details, edit, and test pagination without manual setup.',
      authorUserId: byId.get(3)!.id,
    }),
  ]);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    await prisma.$disconnect();
    process.stderr.write(`${e instanceof Error ? e.stack ?? e.message : String(e)}\n`);
    process.exit(1);
  });
