export type HkjcHadOdds = {
  home: string;
  draw: string;
  away: string;
};

export type HkjcMatch = {
  id: string;
  frontEndId: string;
  title: string;
  homeTeam: string;
  awayTeam: string;
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
