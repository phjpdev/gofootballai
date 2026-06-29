export type HkjcHadOdds = {
  home: string;
  draw: string;
  away: string;
};

export type HkjcHdcOdds = {
  homeLine: string;
  homeOdds: string;
  awayLine: string;
  awayOdds: string;
};

export type HkjcHilOdds = {
  line: string;
  overOdds: string;
  underOdds: string;
};

export type HkjcMatch = {
  id: string;
  frontEndId: string;
  title: string;
  homeTeam: string;
  awayTeam: string;
  homeTeamEn: string;
  awayTeamEn: string;
  homeTeamId: string;
  awayTeamId: string;
  tournamentId: string;
  tournamentCode: string;
  tournamentName: string;
  matchDate: string;
  kickOffTime: string;
  kickOffLabel: string;
  status: string;
  homeLogo: string;
  awayLogo: string;
  tournamentLogo: string;
  hadOdds: HkjcHadOdds | null;
  hdcOdds: HkjcHdcOdds | null;
  hilOdds: HkjcHilOdds | null;
  poolCount: number;
  inplay: boolean;
};

export type HkjcDateItem = {
  key: string;
  day: string;
  date: number;
  hasEvent: boolean;
};

export type HkjcMatchesResponse = {
  matches: HkjcMatch[];
  dates: HkjcDateItem[];
  total: number;
  updatedAt: string;
};

export type HkjcInputSnapshot = {
  matchId: string;
  frontEndId: string;
  homeTeam: string;
  awayTeam: string;
  homeTeamEn?: string;
  awayTeamEn?: string;
  homeTeamId?: string;
  awayTeamId?: string;
  tournamentName: string;
  tournamentCode?: string;
  kickOffTime: string;
  hadOdds: HkjcHadOdds | null;
  hdcOdds: HkjcHdcOdds | null;
  hilOdds: HkjcHilOdds | null;
};
