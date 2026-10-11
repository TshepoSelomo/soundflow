export function formatPlays(value: number): string {
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1)}M`;
  }
  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(0)}K`;
  }
  return String(value);
}

export function formatLongDate(isoDate: string): string {
  return new Date(`${isoDate}T00:00:00`).toLocaleDateString('en-ZA', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export function formatShortDate(isoDate: string): string {
  return new Date(`${isoDate}T00:00:00`).toLocaleDateString('en-ZA', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function formatMonth(isoDate: string): string {
  return new Date(`${isoDate}T00:00:00`).toLocaleDateString('en-ZA', { month: 'short' });
}

export function dayOfMonth(isoDate: string): number {
  return new Date(`${isoDate}T00:00:00`).getDate();
}

export function yearOf(isoDate: string): number {
  return new Date(`${isoDate}T00:00:00`).getFullYear();
}

export function formatClock(totalSeconds: number): string {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const minutes = Math.floor(safe / 60);
  const seconds = safe % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

export function durationToSeconds(duration: string): number {
  const [minutes, seconds] = duration.split(':').map((part) => Number(part));
  if (!Number.isFinite(minutes) || !Number.isFinite(seconds)) {
    return 0;
  }
  return minutes * 60 + seconds;
}

export function timeAgo(iso: string): string {
  const minutes = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (minutes < 60) {
    return `${Math.max(minutes, 0)}m ago`;
  }
  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `${hours}h ago`;
  }
  return `${Math.floor(hours / 24)}d ago`;
}

export function todayIso(): string {
  return new Date().toISOString().split('T')[0];
}
