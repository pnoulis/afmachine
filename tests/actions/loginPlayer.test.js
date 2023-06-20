import { describe, it, expect, vi, beforeAll } from "vitest";
import { generateRandomName } from "js_utils";
import { randomWristband } from "../../scripts/randomWristband.js";
import { randomPlayer } from "../../scripts/randomPlayer.js";
import { emulateScan } from "../../scripts/emulateScan.js";
import backendClientService from "../../src/backend/backend.js";
import * as Errors from "../../src/errors.js";
import { registerPlayer } from "../../src/backend/actions/index.js";

/* LOGIN PLAYER */
import { loginPlayer } from "../../src/backend/actions/loginPlayer.js";

beforeAll(async () => {
  await backendClientService.init();
});

describe("loginPlayer", () => {
  it("Should login a player", async () => {
    const player = randomPlayer();
    await expect(registerPlayer(player)).resolves.toMatchObject({
      result: "OK",
    });
    await expect(
      loginPlayer({
        username: player.username,
        password: player.password,
      })
    ).resolves.toMatchObject({ result: "OK" });
  });
  it("Should respond with", async () => {
    let player = randomPlayer();
    await expect(registerPlayer(player)).resolves.toMatchObject({
      result: "OK",
    });
    let response;
    try {
      response = await loginPlayer({
        username: player.username,
        password: player.password,
      });
    } catch (err) {
      response = err;
    }
    expect(response).toMatchObject({
      result: "OK",
      player: expect.objectContaining({
        username: player.username,
        name: player.name,
        surname: player.surname,
        email: player.email,
      }),
    });
  });
  it("Should validate the input", async () => {
    let response;
    try {
      response = await loginPlayer({});
    } catch (err) {
      response = err;
    }
    expect(response).toBeInstanceOf(Errors.ValidationError);
    expect(response).toMatchObject({
      cause: expect.objectContaining({
        username: expect.any(String),
        password: expect.any(String),
      }),
    });

    const player = randomPlayer();
    await expect(loginPlayer(player)).rejects.toThrowError(Errors.ModelError);
  });
  it("Should require the player to be registered", async () => {
    // just in case that random player was previously registered
    // try and login 3 random players.
    let players = randomPlayer(3);
    for (const player of players) {
      await expect(
        loginPlayer({
          username: player.username,
          password: player.password,
        })
      ).rejects.toThrowError(Errors.ModelError);
    }
  });
});
