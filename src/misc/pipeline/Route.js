function Route(pipeline, route, ...middleware) {
  this.route = route;
  this.queue = middleware; // FIFO
  this.prevIndex = undefined;
  this.context = undefined;

  this.nextErrHandler = function nextErrHandler() {
    console.log(`next error handler: ${this.prevIndex}`);
    for (let i = this.prevIndex + 1; i < this.queue.length; i++) {
      if (this.queue.at(i).length > 2) return i;
    }
    return -1;
  };

  this.runner = async function runner(index, err) {
    this.prevIndex = err ? this.nextErrHandler() : index;
    const middleware = this.queue.at(this.prevIndex /* current index*/);
    if (middleware) {
      await middleware(
        this.context,
        this.runner.bind(this, index + 1 /* next index */),
        err
      );
    }
  };

  this.errorWrapper = async function errorWrapper(index, err) {
    try {
      await this.runner(index, err);
    } catch (err) {
      console.log(`ERROR PREV INDEX: ${this.prevIndex}`);
      if (this.prevIndex === -1) {
        // if all error handling middleware have been called including
        // the last default one, return it to the caller
        throw err;
      } else {
        await this.errorWrapper(index, err);
      }
    }
  };

  const exec = async function exec(pipeline, context = {}) {
    this.queue = pipeline.flat(3);
    this.context = {
      route: this.route,
      req: {
        payload: {
          ...context,
        },
      },
      res: {},
    };
    this.prevIndex = -1;

    await this.errorWrapper(0);
    return this.context;
  };

  const skipNone = exec.bind(this, [
    pipeline.beforeAll,
    this.queue.map((handler) => [
      pipeline.beforeEach,
      handler,
      pipeline.afterEach,
    ]),
    pipeline.afterAll,
    pipeline.last.bind(pipeline, true),
  ]);
  skipNone.skipAll = exec.bind(this, [
    this.queue,
    pipeline.last.bind(pipeline, false),
  ]);
  return skipNone;
}

export { Route };
