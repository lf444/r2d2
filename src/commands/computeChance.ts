import type { Arguments, CommandBuilder } from "yargs";
import { Route } from "../dto/Route";
import fs from "fs";
import { computeChanceOfarrival } from "../function/compute";

type Options = {
  ship: any;
  empire: any;
};

export const command: string = "give-me-the-odds <ship> <empire>";
export const desc: string = "compute <ship> <empire> send back % of succes";

export const builder: CommandBuilder<Options, Options> = (yargs) =>
  yargs.positional("ship", { type: "string", demandOption: true });

export const handler = async (argv: Arguments<Options>): Promise<void> => {
  let falcon = JSON.parse(fs.readFileSync(argv.ship, "utf-8"));
  let empire = JSON.parse(fs.readFileSync(argv.empire, "utf-8"));

  const routes: Route[] = [
    { origin: "Dagobah", destination: "Endor", travel_time: 4 },
    { origin: "Dagobah", destination: "Hoth", travel_time: 1 },
    { origin: "Hoth", destination: "Endor", travel_time: 1 },
    { origin: "Tatooine", destination: "Dagobah", travel_time: 6 },
    { origin: "Tatooine", destination: "Hoth", travel_time: 6 },
  ];
  const chanceOfArrival = computeChanceOfarrival(routes, empire, falcon);
  process.stdout.write(`${chanceOfArrival.percentOfSuccess}%`);
  process.exit(0);
};
