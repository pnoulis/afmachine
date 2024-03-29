function checkSession() {
  return [
    "check/session",
    async (context, next) => {
      const global = context.afmachine.services.storage.global.get(context);
      context.res = {
        payload: {
          msg: "whoetnuh",
        },
      };
      await next();
    },
  ];
}

export { checkSession };
