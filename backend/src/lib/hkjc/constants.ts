export const HKJC_TOURNAMENT_FLAG = (tournamentCode: string) =>
  `https://consvc.hkjc.com/-/media/Sites/JCBW/TournIcon/flag_${tournamentCode}.svg?sc_lang=en-US`;

export const ACTIVE_MATCH_STATUSES = new Set([
  "PREEVENT",
  "PREMATCH",
  "INPLAY",
  "SELLINGSTARTED",
]);
