export function usd(value: number) {
  return `US$ ${value.toFixed(2)}`;
}

export function brl(value: number, rate: number) {
  return (value * rate).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export function pct(value: number) {
  return `-${Math.round(value)}%`;
}

export function ratingColor(percent: number) {
  if (percent >= 80) return "text-acid";
  if (percent >= 60) return "text-amber";
  return "text-ash";
}

export function timeAgo(epochSeconds: number | null) {
  if (!epochSeconds) return null;
  const diff = Date.now() / 1000 - epochSeconds;
  const days = Math.floor(diff / 86400);
  if (days < 1) return "hoje";
  if (days < 30) return `há ${days} d`;
  const months = Math.floor(days / 30);
  if (months < 12) return `há ${months} m`;
  return `há ${Math.floor(months / 12)} a`;
}

export function steamCapsule(appId: string | null | undefined, fallback: string) {
  if (!appId) return fallback;
  return `https://cdn.cloudflare.steamstatic.com/steam/apps/${appId}/library_600x900.jpg`;
}

export function steamHeader(appId: string | null | undefined, fallback: string) {
  if (!appId) return fallback;
  return `https://cdn.cloudflare.steamstatic.com/steam/apps/${appId}/header.jpg`;
}
