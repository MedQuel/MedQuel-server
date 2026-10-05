import type { AudioPlayer } from 'expo-audio';
import { createAudioPlayer, setAudioModeAsync } from 'expo-audio';

export type SoundKey = 'select' | 'lowTime';


const SOUND_SOURCES: Record<SoundKey, number> = {
  select: require('../../assets/sounds/select.mp3'),
  lowTime: require('../../assets/sounds/low-time.mp3'),
};

const players = new Map<SoundKey, AudioPlayer>();
const latestRequestIds = new Map<SoundKey, number>();
let audioModeReady: Promise<void> | null = null;
let preparationReady: Promise<void> | null = null;
let latestPlaybackRequest = 0;
let lastPlaybackKey: SoundKey | null = null;
let lastPlaybackAt = 0;

const DUPLICATE_EVENT_WINDOW_MS = 180;
const SOUND_KEYS: SoundKey[] = ['select', 'lowTime'];

function ensureAudioMode(): Promise<void> {
  if (!audioModeReady) {
    audioModeReady = setAudioModeAsync({
      playsInSilentMode: true,
      allowsRecording: false,
    }).catch((err) => console.warn('[sound] failed to set audio mode:', err));
  }
  return audioModeReady;
}

function getPlayer(key: SoundKey): AudioPlayer {
  let player = players.get(key);
  if (!player) {
    player = createAudioPlayer(SOUND_SOURCES[key]);
    players.set(key, player);
  }
  return player;
}

export function primeSounds(): Promise<void> {
  if (!preparationReady) {
    preparationReady = ensureAudioMode().then(() => {
      SOUND_KEYS.forEach((key) => getPlayer(key));
    });
  }
  return preparationReady;
}


export async function playSound(key: SoundKey, enabled: boolean): Promise<void> {
  if (!enabled) return;
  const now = Date.now();
  if (key === lastPlaybackKey && now-lastPlaybackAt < DUPLICATE_EVENT_WINDOW_MS) {
    return;
  }

  lastPlaybackKey = key;
  lastPlaybackAt = now;
  const playbackRequest = ++latestPlaybackRequest;
  const requestId = (latestRequestIds.get(key) ?? 0) + 1;
  latestRequestIds.set(key, requestId);

  try {
    await primeSounds();
    if (latestRequestIds.get(key) !== requestId || latestPlaybackRequest !== playbackRequest) {
      return;
    }

    const player = getPlayer(key);
    for (const otherPlayer of players.values()) {
      otherPlayer.pause();
    }
    await player.seekTo(0);

    if (latestRequestIds.get(key) !== requestId || latestPlaybackRequest !== playbackRequest) {
      return;
    }
    player.play();
  } catch (err) {
    console.warn(`[sound] failed to play "${key}":`, err);
  }
}

export function releaseSounds(): void {
  latestPlaybackRequest += 1;
  lastPlaybackKey = null;
  lastPlaybackAt = 0;
  SOUND_KEYS.forEach((key) => {
    latestRequestIds.set(key, (latestRequestIds.get(key) ?? 0) + 1);
  });

  for (const player of players.values()) {
    try {
      player.release();
    } catch {}
  }
  players.clear();
  preparationReady = null;
}
