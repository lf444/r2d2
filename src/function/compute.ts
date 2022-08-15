import { BountyHunter, Empire } from "../dto/Empire";
import { Route } from "../dto/Route";
import { Ship } from "../dto/Ship";

interface Edge {
  [origin: string]: Array<{ destination: string; travel_time: number }>;
}

// add edge from origin to destination
function addEdgePlanet(
  origin: string,
  destination: string,
  travel_time: number,
  adjList: Array<Edge>
) {
  const newEdge: Edge = {
    [origin]: [{ destination: destination, travel_time: travel_time }],
  };

  const isMyUexist = adjList.findIndex((e) => Object.keys(e)[0] === origin);
  if (isMyUexist === -1) {
    adjList.push(newEdge);
  } else {
    Object.values(adjList[isMyUexist])[0].push({
      destination: destination,
      travel_time: travel_time,
    });
  }
}

function isNotVisited(
  x: string,
  path: { destination: string; travel_time: number }[]
) {
  for (let i = 0; i < path.length; i++) {
    if (path[i].destination === x) return false;
  }
  return true;
}

const checkIfThereIsEnoughTime = (
  timeLimit: number,
  path: { destination: string; travel_time: number }[],
  currentNodeTravelTime: { destination: string; travel_time: number },
  shipAutonomy: number
): boolean => {
  let initalValue = 0;
  const tempArray = [...path, currentNodeTravelTime];
  for (const p of tempArray) {
    // Check if distance can be done then get fuel & reset ship autonomy
    initalValue += p.travel_time;
  }
  return initalValue <= timeLimit;
};

interface Destination {
  destination: string;
  travel_time: number;
}
const findAllpaths = (
  start: string,
  end: string,
  adj: Array<Edge>,
  shipAutonomy: number,
  countDown: number
): Array<Destination[]> => {
  // Create a queue which stores
  // the paths
  let tempArray = [];
  let queue: Array<any[]> = [];

  // Path vector to store the current path
  let path: Destination[] = [];

  path.push({ destination: start, travel_time: 0 });
  queue.push(path);

  while (queue.length !== 0) {
    path = queue[0];
    queue.shift();
    let last = path[path.length - 1];
    // If last vertex is the desired destination
    // then print the path
    if (last.destination === end) {
      tempArray.push(path);
    }

    const indexOfPlanet = adj.findIndex(
      (e) => last.destination === Object.keys(e)[0]
    );

    // Traverse to all the nodes connected to
    // current vertex and push new path to queue
    const lastNode: any[] =
      indexOfPlanet === -1
        ? []
        : Object.values(adj[indexOfPlanet])[0].map((e) => e);
    let autonomy = shipAutonomy;
    for (let i = 0; i < lastNode.length; i++) {
      if (
        isNotVisited(lastNode[i], path) &&
        lastNode[i].travel_time <= shipAutonomy
      ) {
        if (
          checkIfThereIsEnoughTime(countDown, path, lastNode[i], shipAutonomy)
        ) {
          autonomy -= lastNode[i].travel_time;
          let newpath: Destination[] = Array.from(path);
          newpath.push(lastNode[i]);
          if (lastNode[i].travel_time >= autonomy) {
            newpath.push({
              destination: lastNode[i].destination,
              travel_time: 1,
            });
            autonomy = shipAutonomy;
          }
          queue.push(newpath);
        }
      }
    }
  }

  return tempArray;
};

// Find all avaible route from all routes from start to end
const findAllPathFromStarToTheEnd = (
  currentRoutes: Route[],
  start: string,
  end: string,
  shipAutonomy: number,
  timeLimit: number
): Array<Destination[]> => {
  const adjList: Array<Edge> = [];
  for (const route of currentRoutes) {
    addEdgePlanet(route.origin, route.destination, route.travel_time, adjList);
  }

  return findAllpaths(start, end, adjList, shipAutonomy, timeLimit);
};
const computeProbabilities = (nbOfBountyHunterByPlanet: number): number => {
  if (0) {
    return 100;
  }
  let initalvalue = 0;
  for (let i = 0; i < nbOfBountyHunterByPlanet; i++) {
    initalvalue += Math.pow(9, i) / Math.pow(10, i + 1);
  }
  const percentOfSuccess = 100 - initalvalue * 100;
  return percentOfSuccess <= 0 ? 0 : percentOfSuccess;
};

// Regarder si les jour suivant y'a des pirates
const getProbabilitiesOfArrival = (
  pathFinded: Array<Destination[]>,
  empire: Empire
): chancesOfArrival[] => {
  const probabilities: Array<chancesOfArrival> = [];

  for (const path of pathFinded) {
    let currentDay = 0;
    const initialValue = 0;
    const dayAvailableByPath =
      empire.countdown -
      path.reduce(
        (accumulator, currentDestination) =>
          accumulator + currentDestination.travel_time,
        initialValue
      );
    const bounty_hunter: BountyHunter[] = [];
    let dayToWaitByPlanet = [];

    for (const p of path) {
      currentDay += p.travel_time;
      if (dayAvailableByPath > 0) {
        for (let i = 0; i <= dayAvailableByPath; i++) {
          const test = empire.bounty_hunters.find(
            (bh) => bh.planet === p.destination && bh.day === currentDay + i
          );
          if (!test) {
            dayToWaitByPlanet.push({
              destination: p.destination,
              arrivalShouldbeOnday:
                currentDay !== currentDay + i ? currentDay + i : 0,
            });
            break;
          }
        }
      }

      const test = empire.bounty_hunters.filter(
        (bh) => bh.planet === p.destination && bh.day === currentDay
      );
      bounty_hunter.push(...test);
    }
    dayToWaitByPlanet = dayToWaitByPlanet.filter(
      (bh) => bh.arrivalShouldbeOnday !== 0
    );

    let traveled_time = 0;
    for (const ph of path) {
      traveled_time += ph.travel_time;
      for (const d of dayToWaitByPlanet) {
        if (d.destination === ph.destination) {
          if (d.arrivalShouldbeOnday > traveled_time) {
            traveled_time += d.arrivalShouldbeOnday - traveled_time;
            ph.travel_time += d.arrivalShouldbeOnday - traveled_time;
          }
        }
      }
    }

    if (dayToWaitByPlanet.length > 0 && traveled_time <= empire.countdown) {
      probabilities.push({
        path,
        percentOfSuccess: computeProbabilities(0),
        instrucitonToAvoidPirate: dayToWaitByPlanet,
      });
    } else {
      probabilities.push({
        path,
        percentOfSuccess: computeProbabilities(bounty_hunter.length),
      });
    }
  }
  return probabilities;
};

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
  const PathFinded = findAllPathFromStarToTheEnd(
    routes,
    ship.departure,
    ship.arrival,
    ship.autonomy,
    empire.countdown
  );

  const probabilitiesSucces = getProbabilitiesOfArrival(PathFinded, empire);

  if (probabilitiesSucces.length > 0) {
    const pathWithTheHighestProbabilitiesOfSucces = probabilitiesSucces.reduce(
      (prev, current) =>
        prev.percentOfSuccess > current.percentOfSuccess ? prev : current
    );
    return pathWithTheHighestProbabilitiesOfSucces;
  }
  return { path: [], percentOfSuccess: 0 };
};
