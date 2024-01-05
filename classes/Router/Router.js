class Router {
  static methodsWithBody = ["POST", "PUT"];
  constructor() {
    this.routes = {};
  }

  addRoute(method, path, handler) {
    if (!this.routes[path]) {
      this.routes[path] = {};
    }
    this.routes[path][method] = handler;
  }

  get(path, handler) {
    this.addRoute("GET", path, handler);
  }

  post(path, handler) {
    this.addRoute("POST", path, handler);
  }
  put(path, handler) {
    this.addRoute("PUT", path, handler);
  }

  async handleRequest(req, res) {
    const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
    const pathName = parsedUrl.pathname;
    const queryParams = this._parseQueryParameters(parsedUrl);

    for (const path in this.routes) {
      const route = this.routes[path];
      if (this._matchPath(pathName, path) && route[req.method]) {
        const params = this._extractParams(pathName, path);
        const body = Router.methodsWithBody.includes(req.method)
          ? await this._parseRequestBody(req)
          : null;
        const payload = {
          params,
          queryParams,
          body,
        };
        route[req.method](req, res, payload);
        return;
      }
    }

    res.writeHead(404);
    res.end("Not Found");
  }

  _parseQueryParameters(url) {
    return url.searchParams;
  }

  _matchPath(urlPath, routePath) {
    const urlSegments = urlPath.split("/").filter((p) => p);
    const routeSegments = routePath.split("/").filter((p) => p);

    if (urlSegments.length !== routeSegments.length) {
      return false;
    }

    return routeSegments.every((segment, index) => {
      return segment.startsWith(":") || segment === urlSegments[index];
    });
  }

  _extractParams(urlPath, routePath) {
    const urlSegments = urlPath.split("/").filter((p) => p);
    const routeSegments = routePath.split("/").filter((p) => p);

    return routeSegments.reduce((params, segment, index) => {
      if (segment.startsWith(":")) {
        params[segment.substring(1)] = urlSegments[index];
      }
      return params;
    }, {});
  }

  async _parseRequestBody(req) {
    return new Promise((resolve, reject) => {
      let body = "";
      req.on("data", (chunk) => {
        body += chunk.toString();
      });
      req.on("end", () => {
        const contentType = req.headers["content-type"];
        console.log(contentType, body);
        try {
          if (contentType === "application/json") {
            resolve(JSON.parse(body));
          } else if (contentType === "application/x-www-form-urlencoded") {
            resolve(new URLSearchParams(body));
          } else if (contentType === "application/xml") {
            resolve(body);
          } else if (contentType === "text/html") {
            resolve(body);
          } else {
            resolve(body);
          }
        } catch (error) {
          reject(error);
        }
      });
    });
  }
}

export default Router;
