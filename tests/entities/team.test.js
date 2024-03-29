import { describe, it, expect, beforeAll } from "vitest";

/*
  TESTING COMPONENTS
 */

import { Team } from "/src/entities/team/index.js";
import { Roster } from "/src/entities/roster/index.js";

/*
  DEPENDENCIES
 */

import * as logs from "/src/misc/log.js";
import { PersistentPlayer, Player } from "/src/entities/player/index.js";
import { Wristband } from "/src/entities/wristband/index.js";
import { flushBackendDB } from "agent_factory.shared/scripts/flushBackendDB.js";
import { afmachine } from "/src/index.js";
import { emulateScan } from "agent_factory.shared/scripts/emulateScan.js";
import { delay } from "js_utils/misc";
import { smallid } from "js_utils/uuid";
import { isArray, isObject } from "js_utils/misc";
import * as aferrs from "agent_factory.shared/errors.js";

describe("Entity team", () => {
  it("Should normalize representations", () => {
    // returned by listTeams
    const team = {
      name: "gracious_Finrod",
      totalPoints: 0,
      teamState: null,
      currentRoster: {
        version: 1,
        players: [
          {
            username: "naughty_Fingolfin_462",
            wristbandNumber: 478,
            wristbandColor: null,
          },
          {
            username: "stoic_Saruman_672",
            wristbandNumber: 185,
            wristbandColor: null,
          },
          {
            username: "serene_Merry_839",
            wristbandNumber: 845,
            wristbandColor: null,
          },
          {
            username: "elated_Radagast_668",
            wristbandNumber: 177,
            wristbandColor: null,
          },
          {
            username: "hopeful_Galadriel_699",
            wristbandNumber: 682,
            wristbandColor: null,
          },
          {
            username: "nice_Gimli_1",
            wristbandNumber: 424,
            wristbandColor: null,
          },
        ],
      },
      roomType: null,
      packages: [
        {
          id: 3,
          name: "Per Time 60",
          cost: null,
          started: null,
          ended: null,
          duration: 3600,
          paused: false,
          active: false,
        },
      ],
    };
  }),
    it("Should return a roster instance", () => {
      const r = new Roster();
      expect(r).toBeInstanceOf(Roster);
    });

  it.only("Should be able to take a team in any representation and normalize it into FRONTEND form", () => {
    // no arguments
    let r = new Roster();
    expect(r.asObject()).toEqual([]);

    // an empty array
    r = new Roster([]);
    expect(r.asObject()).toEqual([]);

    // an empty object
    r = new Roster({});
    expect(r.asObject()).toEqual([]);

    // an array of players
    r = new Roster([
      {
        username: "1",
      },
      {
        username: "2",
      },
    ]);

    expect(r.get()).toEqual(
      expect.arrayContaining([
        new Player(
          Player.normalize(
            {
              username: "1",
              wristband: Wristband.normalize(null, { state: "unpaired" }),
            },
            { state: "unregistered" },
          ),
        ),
      ]),
    );

    expect(r.asObject()).toEqual(
      expect.arrayContaining([
        new Player(
          Player.normalize(
            {
              username: "1",
              wristband: Wristband.normalize(null, { state: "unpaired" }),
            },
            { state: "unregistered" },
          ),
        ).asObject(),
      ]),
    );

    // a Team Instance
    // r = new Roster(new Team());
    console.log(new Team());
    let roster = new Team();
    if (roster instanceof Roster) {
      roster = roster.asObject();
    } else if (isObject(roster)) {
      roster =
        roster.roster instanceof Roster
          ? roster.roster.asObject()
          : roster.roster || [];
    } else {
      roster = [];
    }

    console.log(roster);
    console.log("THIS IS THE ROSETR");

    // console.log(new Team());
    // expect(r.get()).toEqual([]);

    // expect(r.asObject()).toEqual(
    //   expect.arrayContaining([
    //     new Player({ username: 1 }),
    //     new Player({ username: 2 }),
    //   ]),
    // );
  });

  it("Should take two argumenst, a roster array and a player factory function", () => {
    const r = new Roster([], (player) => new Player(player));
    expect(r.createPlayer).toBeTypeOf("function");
    expect(r.roster).toBeInstanceOf(Map);
    expect(r.createPlayer()).toBeInstanceOf(Player);
  });
  it("Should fill with every player provided", () => {
    const players = new Array(6)
      .fill(null)
      .map((p) => new PersistentPlayer(afmachine).fill());

    const r = new Roster(players);
    expect(r.roster.size).toEqual(6);
  });

  it("set() should work", () => {
    const r = new Roster();
    expect(r.roster.size).toEqual(0);
    r.set(new Player({ username: "1" }));
    expect(r.roster.size).toEqual(1);
    r.set(new Player({ username: "2" }), new Player({ username: "3" }));
    expect(r.roster.size).toEqual(3);
    r.set(
      new Array(3).fill(null).map((p) => new Player({ username: smallid() })),
    );
    expect(r.roster.size).toEqual(6);
    expect(() => r.set(new Player())).toThrowError(aferrs.ERR_MAX_ROSTER_SIZE);
  });

  it("get() should work", () => {
    const players = new Array(3).fill(null).map((p) => new Player().fill());
    const r = new Roster(players);
    expect(r.get(players[0].username)).toBeTypeOf("object");
    expect(r.get(players[0].username)).toBeInstanceOf(Player);
    expect(r.get(players[0].username, players[1].username)).toHaveLength(2);
  });
  it("Should fill() roster", () => {
    const r = new Roster(
      [
        {
          username: "filis1",
          email: "pnoulis@gmail.com",
        },
      ],
      (player) => new Player(player),
    );
    r.fill();
    expect(r.size).toEqual(6);
    r.rm();
    r.set({ username: "filis1", email: "ninza" });
    r.fill(
      [
        {
          username: "filis1",
        },
        null,
        {
          username: "filis2",
        },
      ],
      { depth: 2 },
    );
    expect(r.get("filis1")).toBeTruthy();
    expect(r.get("filis2")).toBeTruthy();
    expect(r.asObject()).toHaveLength(6);
    expect(r.size).toEqual(6);
    logs.logRoster(r);
  });
  it("Should be able to take a team in any representation and normalize it into FRONTEND form", () => {
    expect(Team.normalize({})).toMatchObject({});
  });
});
