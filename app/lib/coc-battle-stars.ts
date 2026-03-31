/**
 * In-game achievement star strip art (wiki mirror). One composite image per
 * 0–3 star result — use direct paths (no /revision/latest) for hotlinking.
 */
const COC_BATTLE_STAR_COMPOSITE: Record<0 | 1 | 2 | 3, string> = {
  0: "https://static.wikia.nocookie.net/clashofclans/images/6/6a/Achievement_0_star.png",
  1: "https://static.wikia.nocookie.net/clashofclans/images/8/86/Achievement_1_star.png",
  2: "https://static.wikia.nocookie.net/clashofclans/images/5/5e/Achievement_2_stars.png",
  3: "https://static.wikia.nocookie.net/clashofclans/images/0/00/Achievement_3_stars.png",
};

export function cocBattleStarImageUrl(stars: number): string {
  const r = Number.isFinite(stars) ? Math.round(stars) : 0;
  const n = Math.max(0, Math.min(3, r)) as 0 | 1 | 2 | 3;
  return COC_BATTLE_STAR_COMPOSITE[n];
}
