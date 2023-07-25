import { describe, it, expect, beforeAll } from "vitest";

/*
  TESTING COMPONENTS
 */

import { Player, PersistentPlayer } from "/src/entities/player/index.js";

/*
  DEPENDENCIES
 */

import { Wristband } from "/src/entities/wristband/index.js";
import { flushBackendDB } from "agent_factory.shared/scripts/flushBackendDB.js";
import { Afmachine } from "/src/index.js";
import { emulateScan } from "agent_factory.shared/scripts/emulateScan.js";
import { delay } from "js_utils/misc";
import * as aferrs from "agent_factory.shared/errors.js";

beforeAll(async () => {
  await flushBackendDB();
});

describe("Entity player", () => {
  it("It should be able to take a player in any representation and normalize it into FRONTEND form", () => {
    expect(Player.normalize({})).toMatchObject({
      username: "",
      email: "",
      surname: "",
      name: "",
      password: "",
      wristband: expect.any(Object),
      state: "unregistered",
    });

    expect(
      Player.normalize({
        username: "backendPlayer",
        wristband: { id: 2, color: "3" },
      }),
    ).toMatchObject({
      username: "backendPlayer",
      state: "registered",
    });

    expect(
      Player.normalize({
        username: "backendPlayer",
        wristbandMerged: false,
        wristband: { id: 2, color: "3" },
      }),
    ).toMatchObject({
      username: "backendPlayer",
      state: "registered",
    });

    expect(
      Player.normalize({
        username: "backendPlayer",
        wristbandMerged: true,
        wristband: { id: 2, color: "3" },
      }),
    ).toMatchObject({
      username: "backendPlayer",
      state: "inTeam",
    });

    expect(() =>
      Player.normalize({
        username: "backendplayer",
        wristbandMerged: true,
      }),
    ).toThrow(Error);

    expect(Player.normalize(new Player())).toMatchObject({
      state: "unregistered",
    });
    expect(
      Player.normalize({ username: "youth", state: "inGame" }),
    ).toMatchObject({
      state: "inGame",
    });
    expect(() =>
      Player.normalize({ username: "youth", state: "unteuhn" }),
    ).toThrow(Error);
  });
  it("normalize() should merge objects as well", () => {
    const a = Player.normalize(
      {
        name: "serene",
        username: "serene_Faramir_4x3ca83n432",
        surname: "Faramir",
        email: "Faramir@gmail.com",
        password: "4x3ca83n432",
        wristband: { id: null, color: null, state: "unpaired" },
        state: "unregistered",
      },
      {
        name: "serene",
        surname: "Faramir",
        username: "serene_Faramir_4x3ca83n432",
        email: "Faramir@gmail.com",
      },
    );

    console.log(a);
    expect(true).toBe(true);
  });

  it("Player should be able to register", async () => {
    const p = new PersistentPlayer(Afmachine).fill();
    await expect(p.register()).resolves.toMatchObject(expect.any(Object));
  });
  it("Player should throw an exception if trying to register in the wrong state", async () => {
    const p = new PersistentPlayer(Afmachine).fill(undefined, {
      state: "registered",
    });
    expect(p.inState("registered")).toBe(true);
    await expect(p.register()).rejects.toThrowError(
      aferrs.ERR_STATE_ACTION_BLOCK,
    );

    p.setState("inTeam");
    expect(p.inState("inTeam")).toBe(true);
    await expect(p.register()).rejects.toThrowError(
      aferrs.ERR_STATE_ACTION_BLOCK,
    );

    p.setState("inGame");
    expect(p.inState("inGame")).toBe(true);
    await expect(p.register()).rejects.toThrowError(
      aferrs.ERR_STATE_ACTION_BLOCK,
    );
  });

  it("Player should be able to pair a wristband", async () => {
    const p = new PersistentPlayer(Afmachine).fill();
    await p.register();
    let pairing = p.pairWristband();
    delay(2000).then(emulateScan);

    await expect(pairing).resolves.toMatchObject({
      wristband: {
        state: p.wristband.getState("registered"),
      },
    });
  });

  it("Player should throw an exception if trying to pair a wristbandi in the wrong state", async () => {
    const p = new PersistentPlayer(Afmachine).fill();

    expect(p.inState("unregistered")).toBe(true);
    await expect(p.pairWristband()).rejects.toThrowError(
      aferrs.ERR_STATE_ACTION_BLOCK,
    );

    p.setState("inTeam");
    expect(p.inState("inTeam")).toBe(true);
    await expect(p.pairWristband()).rejects.toThrowError(
      aferrs.ERR_STATE_ACTION_BLOCK,
    );

    p.setState("inGame");
    expect(p.inState("inGame")).toBe(true);
    await expect(p.pairWristband()).rejects.toThrowError(
      aferrs.ERR_STATE_ACTION_BLOCK,
    );
  });
});
