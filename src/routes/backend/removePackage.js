import { AF_PACKAGES } from "agent_factory.shared/constants.js";
import { Package } from "../../entities/package/index.js";
import { Team } from "../../entities/team/index.js";

function removePackage(afmachine) {
  return [
    "/team/package/delete",
    // argument parsing and validation
    async function (context, next) {
      context.team = context.args.team;
      context.pkg = context.args.pkg;
      context.req = {
        timestamp: Date.now(),
        teamName: context.team.name,
        packageId: context.pkg.id,
      };
      await next();
    },

    // unregister package
    async (context, next) => {
      context.res = await afmachine.services.backend.removePackage(context.req);
      await next();
    },
    // generic backend response parser
    afmachine.middleware.parseResponse,
    // specific backend response parser
    async function (context, next, err) {
      if (err) {
        context.res.payload = {
          ok: false,
          msg: `Failed to remove package ${context.pkg.id} from ${context.team.name}`,
          reason: err.message,
        };
        throw err;
      }

      const data = [];
      for (let i = 0; i < context.res.team.packages.length; i++) {
        data.push(
          Package.normalize(context.res.team.packages[i], {
            pkgs: AF_PACKAGES,
          }),
        );
      }
      context.res.payload = {
        ok: true,
        msg: `Successfuly removed package ${context.pkg.id} from ${context.team.name}`,
        data,
      };
      await next();
    },
  ];
}

function onRemovePackage(afmachine) {
  return [
    "/team/package/delete",
    // argument parsing and validation
    async function (context, next) {
      // listener
      context.req = context.args.listener;
      if (typeof context.req !== "function") {
        throw new TypeError("onRemovePackage listener function missing");
      }
      await next();
    },
    async (context, next) => {
      context.res = afmachine.services.backend.onRemovePackage(context.req);
      await next();
    },
    async function (context, next, err) {
      if (err) {
        context.res.payload = {
          ok: false,
          msg: "Failed to subscribe to package remove topic",
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

export { removePackage, onRemovePackage };
