import { State } from "./State.js";

class Unregistered extends State {
  constructor(player) {
    super(player);
  }

  register() {}
  pairWristband() {}
}

export { Unregistered };
