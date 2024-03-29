import { stateful } from "js_utils/stateful";
import { eventful } from "js_utils/eventful";
import { normalize } from "./normalize.js";
import { random } from "./random.js";
import { isObject } from "js_utils/misc";
import { Roster } from "../roster/index.js";
import { MAX_TEAM_SIZE } from "agent_factory.shared/constants.js";
import { Package } from "../package/index.js";

class Team {
  static random = random;
  static normalize = normalize;
  constructor(team, { createRoster } = {}) {
    team ??= {};
    this.name = team.name || "";
    this.points = team.points ?? 0;
    this.roster =
      team.roster instanceof Roster ? team.roster : new Roster(team.roster);
    this.packages = team.packages || [];
    this.state = team.state || "";
    this.created = team.created ?? null;
    this.lastRegisterAttempt = team.lastRegisterAttempt ?? null;
    this.played = team.played ?? 0;
    this.wins = team.wins ?? 0;
    this.losses = team.losses ?? 0;
  }

  get size() {
    return this.roster.size;
  }
}

Team.prototype.addPlayer = function () {};
Team.prototype.removePlayer = function () {};
Team.prototype.startPackage = function () {};
Team.prototype.stopPackage = function () {};
Team.prototype.unregisterPackage = function () {};
Team.prototype.registerPackage = function () {};
Team.prototype.payPackage = function () {};
Team.prototype.merge = function () {};

Team.prototype.fill = function (
  source,
  {
    state = "",
    defaultState = "",
    nulls = false,
    size = MAX_TEAM_SIZE,
    depth = 0,
  } = {},
) {
  source ??= {};
  const target = Team.random(
    Team.normalize([this, source], { state, defaultState, nulls }),
    { size, depth: depth - 1 },
  );
  this.name = target.name;
  this.points = target.points;
  this.state = target.state;
  if (depth) {
    this.roster.fill(target.roster, { size, depth: depth - 1 });
  }
  return this;
};

Team.prototype.asObject = function () {
  return {
    name: this.name,
    points: this.points,
    roster: this.roster.asObject(),
    state: isObject(this.state) ? this.state.name : this.state,
  };
};

Team.prototype.log = function () {
  console.log("------------------------------");
  console.log("team: ", this.name);
  console.log("points: ", this.points);
  console.log("state: ", isObject(this.state) ? this.state.name : this.state);
  this.roster.log();
  console.log("------------------------------");
};

export { Team };
