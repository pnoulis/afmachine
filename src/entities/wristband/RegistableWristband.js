import { LiveWristband } from "./LiveWristband.js";
import * as aferrs from "agent_factory.shared/errors.js";

class RegistableWristband extends LiveWristband {
  constructor(afmachine, wristband, player) {
    super(afmachine, wristband);
    this.player = player;
  }
  pair() {
    return this.scan()
      .then(this.verify.bind(this))
      .then((wristband) => {
        return this.register({
          wristband: wristband,
          player: this.player,
        });
      })
      .then((player) => {
        this.fill(player.wristband, { state: "registered" });
      });
  }

  unpair() {
    return this.inState("registered")
      ? this.unregister().then(() => this.unscan())
      : this.unscan();
  }
}

export { RegistableWristband };
