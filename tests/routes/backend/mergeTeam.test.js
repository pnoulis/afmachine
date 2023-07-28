import { describe, it, expect, vi, beforeAll } from "vitest";

/*
  TESTING COMPONENTS
*/

import { afmachine } from "../../../src/index.js";

/*
  DEPENDENCIES
 */
import { registerPlayer } from "agent_factory.shared/scripts/registerPlayer.js";
import { registerWristband } from "agent_factory.shared/scripts/registerWristband.js";
import { flushBackendDB } from "agent_factory.shared/scripts/flushBackendDB.js";
import { randomWristband } from "agent_factory.shared/scripts/randomWristband.js";
import { randomPlayer } from "agent_factory.shared/scripts/randomPlayer.js";

let players;
beforeAll(async () => {
  await flushBackendDB();
  await registerWristband(6).then((response) => {
    players = response;
  });
});

describe("Merge team", () => {
  it("Should merge a team", async () => {
    await expect(
      afmachine.mergeTeam({
        name: "someName",
        players,
      }),
    ).resolves.toMatchObject(expect.any(Object));
  });
});
