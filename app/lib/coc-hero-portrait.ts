/**
 * In-game hero portrait URLs mirrored on the Clash of Clans Wiki (Fandom).
 * Use **direct** `/images/.../File.png` paths only — do NOT use `/revision/latest`
 * (Fandom’s CDN returns 404 for those when `Referer` is not from *.fandom.com).
 */
const COC_HERO_PORTRAIT_BY_NAME: Record<string, string> = {
  "Barbarian King":
    "https://static.wikia.nocookie.net/clashofclans/images/b/b1/Barbarian_King_Icon.png",
  "Archer Queen":
    "https://static.wikia.nocookie.net/clashofclans/images/2/24/Archer_Queen_Icon.png",
  "Grand Warden":
    "https://static.wikia.nocookie.net/clashofclans/images/f/f9/Grand_Warden_Icon.png",
  "Royal Champion":
    "https://static.wikia.nocookie.net/clashofclans/images/6/6a/Royal_Champion_Icon.png",
  "Minion Prince":
    "https://static.wikia.nocookie.net/clashofclans/images/8/89/Minion_Prince_Icon.png",
  "Dragon Duke":
    "https://static.wikia.nocookie.net/clashofclans/images/d/d6/Avatar_Hero_Dragon_Duke.png",
  "Battle Machine":
    "https://static.wikia.nocookie.net/clashofclans/images/9/92/Battle_Machine_Icon.png",
};

export function cocHeroPortraitUrl(heroName: string): string | undefined {
  const key = heroName.trim();
  return COC_HERO_PORTRAIT_BY_NAME[key];
}
