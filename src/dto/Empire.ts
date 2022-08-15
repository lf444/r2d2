export interface Empire {
  countdown: number;
  bounty_hunters: BountyHunter[];
}

export interface BountyHunter {
  planet: string;
  day: number;
}
