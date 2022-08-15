import { BountyHunter, Empire } from "../dto/Empire";
import { Route } from "../dto/Route";
import { Ship } from "../dto/Ship";
import { Destination, findAllPathFromStarToTheEnd } from "./path";
import { getProbabilitiesOfArrival } from "./probabilities";

export interface chancesOfArrival {
  path: Destination[];
  percentOfSuccess: number;
  instrucitonToAvoidPirate?: {
    destination: string;
    arrivalShouldbeOnday: number;
  }[];
}
export const computeChanceOfarrival = (
  routes: Route[],
  empire: Empire,
  ship: Ship
): chancesOfArrival => {
  const pathFinded = findAllPathFromStarToTheEnd(
    routes,
    ship.departure,
    ship.arrival,
    ship.autonomy,
    empire.countdown
  );

  const probabilitiesSucces = getProbabilitiesOfArrival(pathFinded, empire);
  if (probabilitiesSucces.length > 0) {
    const pathWithTheHighestProbabilitiesOfSucces = probabilitiesSucces.reduce(
      (prev, current) =>
        prev.percentOfSuccess > current.percentOfSuccess ? prev : current
    );
    return pathWithTheHighestProbabilitiesOfSucces;
  }
  return { path: [], percentOfSuccess: 0 };
};
