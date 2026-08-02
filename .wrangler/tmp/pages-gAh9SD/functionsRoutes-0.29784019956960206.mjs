import { onRequest as __api_data_ts_onRequest } from "/home/johannes/Projects/ferreras.tours/functions/api/data.ts"
import { onRequest as __api_upload_ts_onRequest } from "/home/johannes/Projects/ferreras.tours/functions/api/upload.ts"
import { onRequest as __blog_ts_onRequest } from "/home/johannes/Projects/ferreras.tours/functions/blog.ts"
import { onRequest as __init_data_ts_onRequest } from "/home/johannes/Projects/ferreras.tours/functions/init-data.ts"
import { onRequest as ___middleware_ts_onRequest } from "/home/johannes/Projects/ferreras.tours/functions/_middleware.ts"

export const routes = [
    {
      routePath: "/api/data",
      mountPath: "/api",
      method: "",
      middlewares: [],
      modules: [__api_data_ts_onRequest],
    },
  {
      routePath: "/api/upload",
      mountPath: "/api",
      method: "",
      middlewares: [],
      modules: [__api_upload_ts_onRequest],
    },
  {
      routePath: "/blog",
      mountPath: "/",
      method: "",
      middlewares: [],
      modules: [__blog_ts_onRequest],
    },
  {
      routePath: "/init-data",
      mountPath: "/",
      method: "",
      middlewares: [],
      modules: [__init_data_ts_onRequest],
    },
  {
      routePath: "/",
      mountPath: "/",
      method: "",
      middlewares: [___middleware_ts_onRequest],
      modules: [],
    },
  ]