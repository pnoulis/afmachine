function startTeam(afmachine) {
  return [
    "/team/activate",
    // argument parsing and validation
    async function (context, next) {
      context.team = context.args.team ?? context.args;
      context.req = {
        timestamp: Date.now(),
        teamName: context.team.name,
      };
      await next();
    },

    // start team
    async (context, next) => {
      context.res = await afmachine.services.backend.startTeam(context.req);
      await next();
    },
    // generic backend response parser
    afmachine.middleware.parseResponse,
    // specific backend response parsing
    async function (context, next, err) {
      if (err) {
        context.res.payload = {
          ok: false,
          msg: `Failed to active team ${context.team.name}`,
          reason: err.message,
        };
        throw err;
      }

      context.pkg = context.team.packages[0];
      context.res.payload = {
        ok: true,
        msg: `Successfuly activated team ${context.team.name}`,
        data: context.res,
      };
      await next();
    },
    afmachine.middleware.statisticActivatedPackages,
    afmachine.middleware.statisticProfits,
  ];
}

function onStartTeam(afmachine) {
  return [
    "/team/activate",
    // argument parsing and validation
    async function (context, next) {
      // listener
      context.req = context.args.listener;
      if (typeof context.req !== "function") {
        throw new TypeError("onStartTeam listener function missing");
      }
      await next();
    },
    async (context, next) => {
      context.res = afmachine.services.backend.onStartTeam(context.req);
      await next();
    },
    async function (context, next, err) {
      if (err) {
        context.res.payload = {
          ok: false,
          msg: "Failed to subscribe to start team topic",
          reason: err.message,
        };
        throw err;
      }
      context.res.payload = {
        ok: true,
        // unsubscribe function
        data: context.res,
      };
      await next();
    },
  ];
}

export { startTeam, onStartTeam };
