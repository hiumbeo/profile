import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '10mb' }));

// Helper to resolve Discord flags into badges
function calculateDiscordBadges(flags: number) {
  return {
    staff: (flags & (1 << 0)) !== 0,
    partner: (flags & (1 << 1)) !== 0,
    hypeSquadEvents: (flags & (1 << 2)) !== 0,
    bugHunterLevel1: (flags & (1 << 3)) !== 0,
    hypeSquadBravery: (flags & (1 << 6)) !== 0,
    hypeSquadBrilliance: (flags & (1 << 7)) !== 0,
    hypeSquadBalance: (flags & (1 << 8)) !== 0,
    earlySupporter: (flags & (1 << 9)) !== 0,
    bugHunterLevel2: (flags & (1 << 14)) !== 0,
    verifiedBotDev: (flags & (1 << 17)) !== 0,
    activeDeveloper: (flags & (1 << 22)) !== 0,
  };
}

function getDiscordAccountCreatedDate(id: string): string {
  try {
    const timestampMs = Number((BigInt(id) >> 22n) + 1420070400000n);
    const date = new Date(timestampMs);
    return date.toLocaleDateString('vi-VN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return '15 thg 10, 2026';
  }
}

// 0. API: Fetch Discord Profile from Server Environment Variable (DISCORD_TOKEN)
app.get('/api/discord/server-profile', async (_req: Request, res: Response) => {
  const token = process.env.DISCORD_TOKEN;
  if (!token) {
    return res.json({ hasEnvToken: false });
  }

  const cleanToken = token.trim().replace(/^Bot\s+/i, '');

  try {
    const userRes = await fetch('https://discord.com/api/v10/users/@me', {
      headers: {
        Authorization: cleanToken,
      },
    });

    if (!userRes.ok) {
      return res.json({ hasEnvToken: false, error: 'Token in environment is invalid' });
    }

    const userData = await userRes.json();
    const { id, username, discriminator, global_name, avatar, avatar_decoration_data, banner, accent_color, bio, flags, public_flags } = userData;

    let avatarUrl = 'https://cdn.discordapp.com/embed/avatars/0.png';
    if (avatar) {
      const isGif = avatar.startsWith('a_');
      avatarUrl = `https://cdn.discordapp.com/avatars/${id}/${avatar}.${isGif ? 'gif' : 'png'}?size=512`;
    }

    let avatarDecorUrl: string | null = null;
    if (avatar_decoration_data && avatar_decoration_data.asset) {
      avatarDecorUrl = `https://cdn.discordapp.com/avatar-decoration-presets/${avatar_decoration_data.asset}.png?size=256`;
    }

    let bannerUrl: string | null = null;
    if (banner) {
      const isGif = banner.startsWith('a_');
      bannerUrl = `https://cdn.discordapp.com/banners/${id}/${banner}.${isGif ? 'gif' : 'png'}?size=1024`;
    }

    const badgeFlags = calculateDiscordBadges(flags || public_flags || 0);

    return res.json({
      hasEnvToken: true,
      id,
      username,
      discriminator,
      displayName: global_name || username,
      avatarUrl,
      avatarDecorUrl,
      avatarDecorData: avatar_decoration_data || null,
      bannerUrl,
      accentColor: accent_color ? `#${accent_color.toString(16).padStart(6, '0')}` : '#8a2be2',
      bio: bio || '',
      accountCreatedDate: getDiscordAccountCreatedDate(id),
      badges: {
        nitro: Boolean(banner || avatar?.startsWith('a_') || avatar_decoration_data),
        booster: false,
        hypeSquad: badgeFlags.hypeSquadBravery
          ? 'bravery'
          : badgeFlags.hypeSquadBrilliance
          ? 'brilliance'
          : badgeFlags.hypeSquadBalance
          ? 'balance'
          : 'none',
        activeDev: badgeFlags.activeDeveloper,
        earlySupporter: badgeFlags.earlySupporter,
        bugHunter: badgeFlags.bugHunterLevel1 || badgeFlags.bugHunterLevel2,
        botDev: badgeFlags.verifiedBotDev,
      },
    });
  } catch (err: unknown) {
    return res.json({ hasEnvToken: false, error: 'Failed to contact Discord API' });
  }
});

// 1. API: Fetch Discord Profile via Token
app.post('/api/discord/token', async (req: Request, res: Response) => {
  const { token } = req.body;
  if (!token || typeof token !== 'string') {
    return res.status(400).json({ error: 'Token is required' });
  }

  // Sanitize token (remove quotes or "Bot " if user pasted with it)
  const cleanToken = token.trim().replace(/^Bot\s+/i, '');

  try {
    const userRes = await fetch('https://discord.com/api/v10/users/@me', {
      headers: {
        Authorization: cleanToken,
      },
    });

    if (!userRes.ok) {
      const errText = await userRes.text();
      return res.status(userRes.status).json({
        error: `Discord API returned ${userRes.status}`,
        details: errText,
      });
    }

    const userData = await userRes.json();
    const { id, username, discriminator, global_name, avatar, avatar_decoration_data, banner, accent_color, bio, flags, public_flags } = userData;

    // Avatar URL
    let avatarUrl = 'https://cdn.discordapp.com/embed/avatars/0.png';
    if (avatar) {
      const isGif = avatar.startsWith('a_');
      avatarUrl = `https://cdn.discordapp.com/avatars/${id}/${avatar}.${isGif ? 'gif' : 'png'}?size=512`;
    }

    // Avatar Decoration URL
    let avatarDecorUrl: string | null = null;
    if (avatar_decoration_data && avatar_decoration_data.asset) {
      avatarDecorUrl = `https://cdn.discordapp.com/avatar-decoration-presets/${avatar_decoration_data.asset}.png?size=256`;
    }

    // Banner URL
    let bannerUrl: string | null = null;
    if (banner) {
      const isGif = banner.startsWith('a_');
      bannerUrl = `https://cdn.discordapp.com/banners/${id}/${banner}.${isGif ? 'gif' : 'png'}?size=1024`;
    }

    const badgeFlags = calculateDiscordBadges(flags || public_flags || 0);

    return res.json({
      id,
      username,
      discriminator,
      displayName: global_name || username,
      avatarUrl,
      avatarDecorUrl,
      avatarDecorData: avatar_decoration_data || null,
      bannerUrl,
      accentColor: accent_color ? `#${accent_color.toString(16).padStart(6, '0')}` : '#8a2be2',
      bio: bio || '',
      accountCreatedDate: getDiscordAccountCreatedDate(id),
      badges: {
        nitro: Boolean(banner || avatar?.startsWith('a_') || avatar_decoration_data),
        booster: false,
        hypeSquad: badgeFlags.hypeSquadBravery
          ? 'bravery'
          : badgeFlags.hypeSquadBrilliance
          ? 'brilliance'
          : badgeFlags.hypeSquadBalance
          ? 'balance'
          : 'none',
        activeDev: badgeFlags.activeDeveloper,
        earlySupporter: badgeFlags.earlySupporter,
        bugHunter: badgeFlags.bugHunterLevel1 || badgeFlags.bugHunterLevel2,
        botDev: badgeFlags.verifiedBotDev,
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to connect to Discord';
    return res.status(500).json({ error: message });
  }
});

// 2. API: Fetch Discord Profile via Discord User ID (using Lanyard or public resolver)
app.get('/api/discord/user/:userId', async (req: Request, res: Response) => {
  const { userId } = req.params;
  if (!userId || !/^\d{17,20}$/.test(userId)) {
    return res.status(400).json({ error: 'Invalid Discord User ID' });
  }

  try {
    // 1st attempt: Lanyard API (includes live presence, avatar decor, spotify, games)
    const lanyardRes = await fetch(`https://api.lanyard.rest/v1/users/${userId}`);
    if (lanyardRes.ok) {
      const { data } = await lanyardRes.json();
      const user = data.discord_user;

      let avatarUrl = 'https://cdn.discordapp.com/embed/avatars/0.png';
      if (user.avatar) {
        const isGif = user.avatar.startsWith('a_');
        avatarUrl = `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.${isGif ? 'gif' : 'png'}?size=512`;
      }

      let avatarDecorUrl: string | null = null;
      if (user.avatar_decoration_data && user.avatar_decoration_data.asset) {
        avatarDecorUrl = `https://cdn.discordapp.com/avatar-decoration-presets/${user.avatar_decoration_data.asset}.png?size=256`;
      }

      let bannerUrl: string | null = null;
      if (user.banner) {
        const isGif = user.banner.startsWith('a_');
        bannerUrl = `https://cdn.discordapp.com/banners/${user.id}/${user.banner}.${isGif ? 'gif' : 'png'}?size=1024`;
      }

      // Check spotify or activities
      let activityData = null;
      if (data.spotify) {
        activityData = {
          type: 'spotify',
          title: data.spotify.song,
          subtitle: data.spotify.artist,
          details: data.spotify.album,
          image: data.spotify.album_art_url,
          elapsedSeconds: Math.floor((Date.now() - data.spotify.timestamps.start) / 1000),
          totalDurationSeconds: Math.floor(
            (data.spotify.timestamps.end - data.spotify.timestamps.start) / 1000
          ),
        };
      } else if (data.activities && data.activities.length > 0) {
        const game = data.activities.find((a: any) => a.type === 0);
        if (game) {
          activityData = {
            type: 'game',
            title: game.name,
            subtitle: game.details || game.state || 'In game',
            details: game.state || '',
            image: game.assets?.large_image 
              ? (game.assets.large_image.startsWith('mp:external') 
                  ? `https://media.discordapp.net/${game.assets.large_image.replace('mp:', '')}`
                  : `https://cdn.discordapp.com/app-assets/${game.application_id}/${game.assets.large_image}.png`)
              : 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=300&auto=format&fit=crop&q=80',
            elapsedSeconds: game.timestamps?.start ? Math.floor((Date.now() - game.timestamps.start) / 1000) : 0,
            totalDurationSeconds: 3600,
          };
        }
      }

      const badgeFlags = calculateDiscordBadges(user.public_flags || 0);

      return res.json({
        id: user.id,
        username: user.username,
        discriminator: user.discriminator,
        displayName: user.global_name || user.username,
        avatarUrl,
        avatarDecorUrl,
        avatarDecorData: user.avatar_decoration_data || null,
        bannerUrl,
        accentColor: '#8a2be2',
        accountCreatedDate: getDiscordAccountCreatedDate(user.id),
        status: data.discord_status || 'online',
        activity: activityData,
        badges: {
          nitro: Boolean(user.banner || user.avatar?.startsWith('a_') || user.avatar_decoration_data),
          booster: false,
          hypeSquad: badgeFlags.hypeSquadBravery
            ? 'bravery'
            : badgeFlags.hypeSquadBrilliance
            ? 'brilliance'
            : badgeFlags.hypeSquadBalance
            ? 'balance'
            : 'none',
          activeDev: badgeFlags.activeDeveloper,
          earlySupporter: badgeFlags.earlySupporter,
          bugHunter: badgeFlags.bugHunterLevel1 || badgeFlags.bugHunterLevel2,
          botDev: badgeFlags.verifiedBotDev,
        },
      });
    }

    // 2nd fallback: Discord public lookup service
    const lookupRes = await fetch(`https://discordlookup.mesalytic.moe/v1/user/${userId}`);
    if (lookupRes.ok) {
      const data = await lookupRes.json();
      let avatarUrl = data.avatar?.link || 'https://cdn.discordapp.com/embed/avatars/0.png';
      let avatarDecorUrl = data.avatar_decoration?.asset 
        ? `https://cdn.discordapp.com/avatar-decoration-presets/${data.avatar_decoration.asset}.png?size=256` 
        : null;
      let bannerUrl = data.banner?.link || null;

      const badgeFlags = calculateDiscordBadges(data.badges || 0);

      return res.json({
        id: data.id,
        username: data.tag || data.username,
        displayName: data.global_name || data.username,
        avatarUrl,
        avatarDecorUrl,
        avatarDecorData: data.avatar_decoration || null,
        bannerUrl,
        accentColor: data.banner?.color ? `#${data.banner.color}` : '#8a2be2',
        accountCreatedDate: getDiscordAccountCreatedDate(data.id),
        bio: data.bio || '',
        badges: {
          nitro: Boolean(data.banner?.link || data.avatar?.is_animated),
          booster: false,
          hypeSquad: badgeFlags.hypeSquadBravery
            ? 'bravery'
            : badgeFlags.hypeSquadBrilliance
            ? 'brilliance'
            : badgeFlags.hypeSquadBalance
            ? 'balance'
            : 'none',
          activeDev: badgeFlags.activeDeveloper,
          earlySupporter: badgeFlags.earlySupporter,
          bugHunter: badgeFlags.bugHunterLevel1 || badgeFlags.bugHunterLevel2,
          botDev: badgeFlags.verifiedBotDev,
        },
      });
    }

    return res.status(404).json({ error: 'Discord User not found or not in Lanyard/Lookup' });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Lookup failed';
    return res.status(500).json({ error: message });
  }
});

const STATS_FILE = path.join(__dirname, 'stats.json');

function loadStats(): { views: number; likes: number } {
  try {
    if (fs.existsSync(STATS_FILE)) {
      const raw = fs.readFileSync(STATS_FILE, 'utf-8');
      return JSON.parse(raw);
    }
  } catch {
    // fallback
  }
  return { views: 1284, likes: 342 };
}

function saveStats(stats: { views: number; likes: number }) {
  try {
    fs.writeFileSync(STATS_FILE, JSON.stringify(stats, null, 2), 'utf-8');
  } catch {
    // fallback
  }
}

let currentStats = loadStats();

// 3. API: Views & Likes stats
app.get('/api/stats', (_req: Request, res: Response) => {
  return res.json(currentStats);
});

app.post('/api/stats/view', (_req: Request, res: Response) => {
  currentStats.views += 1;
  saveStats(currentStats);
  return res.json(currentStats);
});

app.post('/api/stats/like', (_req: Request, res: Response) => {
  currentStats.likes += 1;
  saveStats(currentStats);
  return res.json(currentStats);
});

// Serve public music files
app.use('/music', express.static(path.join(__dirname, 'public', 'music')));

// Vite middleware or production static files
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  });
}

startServer();
