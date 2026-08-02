var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// api/data.ts
var RESOURCE_WITH_LOCALE = /* @__PURE__ */ new Set([
  "blog",
  "i18n",
  "tour",
  "tours",
  "transport",
  "transport-services",
  "example-tours",
  "story-elements",
  "intro-story",
  "translations"
]);
var readLocalJson = /* @__PURE__ */ __name(async (key, requestUrl) => {
  try {
    const origin = requestUrl ? new URL(requestUrl).origin : "";
    const url = `${origin}/data/${key}.json`;
    const response = await fetch(url);
    if (!response.ok) {
      return null;
    }
    return await response.json();
  } catch (err) {
    console.warn("[Cloudflare Function] Failed to read local JSON for", key, err);
    return null;
  }
}, "readLocalJson");
var buildResourceKey = /* @__PURE__ */ __name((resource, locale) => {
  const normalized = resource.trim().toLowerCase();
  if (RESOURCE_WITH_LOCALE.has(normalized)) {
    const lang = locale?.trim().toLowerCase();
    if (!lang) {
      return null;
    }
    return `${normalized}-${lang}`;
  }
  return normalized;
}, "buildResourceKey");
var createErrorResponse = /* @__PURE__ */ __name((message, status = 400) => new Response(JSON.stringify({ error: message }), {
  status,
  headers: { "Content-Type": "application/json" }
}), "createErrorResponse");
var JSONBIN_RESOURCE_MAP = {
  "brand": "VITE_JSONBIN_BRAND_BIN_ID",
  "transfer-config": "VITE_JSONBIN_TRANSFER_BIN_ID",
  "social-media": "VITE_JSONBIN_SOCIAL_BIN_ID",
  "testimonials": "VITE_JSONBIN_TESTIMONIALS_BIN_ID",
  "blog": { en: "VITE_JSONBIN_BLOG_EN", es: "VITE_JSONBIN_BLOG_ES" },
  "tours": { en: "VITE_JSONBIN_TOURS_EN", es: "VITE_JSONBIN_TOURS_ES" },
  "transport-services": { en: "VITE_JSONBIN_TRANSPORT_EN", es: "VITE_JSONBIN_TRANSPORT_ES" },
  "example-tours": { en: "VITE_JSONBIN_EXAMPLETESTOURS_EN_BIN_ID", es: "VITE_JSONBIN_EXAMPLETESTOURS_ES_BIN_ID" },
  "story-elements": { en: "VITE_JSONBIN_STORY_ELEMENTS_EN", es: "VITE_JSONBIN_STORY_ELEMENTS_ES" },
  "intro-story": { en: "VITE_JSONBIN_JOURNEY_EN", es: "VITE_JSONBIN_JOURNEY_ES" },
  "translations": { en: "VITE_JSONBIN_EN_BIN_ID", es: "VITE_JSONBIN_ES_BIN_ID" }
};
var parseResourceKey = /* @__PURE__ */ __name((key) => {
  const match2 = /^(.*)-(en|es)$/.exec(key);
  if (match2) {
    return { resource: match2[1], locale: match2[2] };
  }
  return { resource: key };
}, "parseResourceKey");
var normalizeJsonBinUrl = /* @__PURE__ */ __name((binDefinition, method = "GET") => {
  if (!binDefinition || !binDefinition.trim()) return null;
  const trimmed = binDefinition.trim();
  const base = /^https?:\/\//i.test(trimmed) ? trimmed.replace(/\/latest\/?$/i, "") : `https://api.jsonbin.io/v3/b/${trimmed}`;
  return method === "GET" ? `${base}/latest` : base;
}, "normalizeJsonBinUrl");
var getJsonBinUrl = /* @__PURE__ */ __name((resource, locale, env, method = "GET") => {
  const entry = JSONBIN_RESOURCE_MAP[resource];
  if (!entry) {
    return null;
  }
  if (typeof entry === "string") {
    return normalizeJsonBinUrl(env[entry], method);
  }
  if (!locale) {
    return null;
  }
  const envKey = entry[locale];
  return normalizeJsonBinUrl(env[envKey], method);
}, "getJsonBinUrl");
var jsonBinFetch = /* @__PURE__ */ __name(async (url, masterKey) => {
  try {
    const headers = { Accept: "application/json" };
    if (masterKey) {
      headers["X-Master-Key"] = masterKey;
    }
    const response = await fetch(url, {
      method: "GET",
      headers,
      cache: "no-cache"
    });
    if (!response.ok) {
      console.warn("[Cloudflare Function] JSONBin fetch failed for", url, response.status);
      return null;
    }
    return await response.json();
  } catch (error) {
    console.warn("[Cloudflare Function] JSONBin fetch error for", url, error);
    return null;
  }
}, "jsonBinFetch");
var loadStoredData = /* @__PURE__ */ __name(async (key, env, requestUrl) => {
  const dataKV = env.DATA_KV_F ?? env.DATA_KV;
  if (dataKV && typeof dataKV.get === "function") {
    try {
      const stored = await dataKV.get(key, { type: "json" });
      if (stored !== null) {
        return stored;
      }
    } catch (err) {
      console.warn("[Cloudflare Function] KV read failed for", key, err);
    }
  }
  const localData = await readLocalJson(key, requestUrl);
  if (localData !== null) {
    return localData;
  }
  const { resource, locale } = parseResourceKey(key);
  const jsonBinUrl = getJsonBinUrl(resource, locale, env, "GET");
  if (!jsonBinUrl) {
    return null;
  }
  const payload = await jsonBinFetch(jsonBinUrl, env.VITE_JSONBIN_MASTER_KEY);
  if (payload === null) {
    return null;
  }
  try {
    await saveStoredData(key, payload, env);
  } catch (err) {
    console.warn("[Cloudflare Function] Failed to persist JSONBin fallback for", key, err);
  }
  return payload;
}, "loadStoredData");
var saveStoredData = /* @__PURE__ */ __name(async (key, payload, env) => {
  const dataKV = env.DATA_KV_F ?? env.DATA_KV;
  if (dataKV && typeof dataKV.put === "function") {
    try {
      await dataKV.put(key, JSON.stringify(payload));
      return;
    } catch (err) {
      console.warn("[Cloudflare Function] KV write failed for", key, err);
    }
  }
  const { resource, locale } = parseResourceKey(key);
  const jsonBinUrl = getJsonBinUrl(resource, locale, env, "PUT");
  if (!jsonBinUrl) {
    console.warn("[Cloudflare Function] No storage backend available for", key, "- skipping persistence");
    return;
  }
  const masterKey = env.VITE_JSONBIN_MASTER_KEY;
  if (!masterKey) {
    console.warn("[Cloudflare Function] JSONBin URL found but VITE_JSONBIN_MASTER_KEY is missing - skipping persistence");
    return;
  }
  const response = await fetch(jsonBinUrl, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "X-Master-Key": masterKey
    },
    body: JSON.stringify(payload)
  });
  if (!response.ok) {
    console.warn("[Cloudflare Function] JSONBin PUT fallback failed for", key, "with status", response.status);
  }
}, "saveStoredData");
async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const resource = url.searchParams.get("resource");
  const locale = url.searchParams.get("locale");
  if (!resource) {
    return createErrorResponse("Missing resource query parameter.", 400);
  }
  const key = buildResourceKey(resource, locale || void 0);
  if (!key) {
    return createErrorResponse("Missing or invalid locale for resource.", 400);
  }
  try {
    if (request.method === "GET") {
      const data = await loadStoredData(key, env, request.url);
      if (data === null || data === void 0) {
        return createErrorResponse(`Data for resource '${resource}' not found.`, 404);
      }
      return new Response(JSON.stringify(data), {
        status: 200,
        headers: { "Content-Type": "application/json", "Cache-Control": "public, max-age=60" }
      });
    }
    if (request.method === "PUT") {
      const adminPassword = env.ADMIN_PASSWORD || env.VITE_ADMIN_PASSWORD || "c@n@rio2690";
      const providedPassword = request.headers.get("X-Admin-Password") || "";
      if (providedPassword !== adminPassword) {
        return createErrorResponse("Unauthorized: invalid admin password.", 401);
      }
      const body = await request.json().catch(() => null);
      if (body === null) {
        return createErrorResponse("Request body must be valid JSON.", 400);
      }
      await saveStoredData(key, body, env);
      return new Response(JSON.stringify(body), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    }
    return createErrorResponse("Unsupported HTTP method.", 405);
  } catch (error) {
    return createErrorResponse(error?.message ?? "Internal error", 500);
  }
}
__name(onRequest, "onRequest");

// api/upload.ts
async function onRequest2(context) {
  const { request, env } = context;
  if (request.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" }
    });
  }
  const adminPassword = env.ADMIN_PASSWORD || "toursadmin";
  const providedPassword = request.headers.get("X-Admin-Password") || "";
  if (providedPassword !== adminPassword) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" }
    });
  }
  const cloudName = env.CLOUDINARY_CLOUD_NAME;
  const apiKey = env.CLOUDINARY_API_KEY;
  const apiSecret = env.CLOUDINARY_API_SECRET;
  if (!cloudName || !apiKey || !apiSecret) {
    return new Response(
      JSON.stringify({ error: "Cloudinary credentials not configured on server" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
  try {
    const formData = await request.formData();
    const file = formData.get("file");
    if (!file || !(file instanceof File)) {
      return new Response(
        JSON.stringify({ error: "Missing file in upload" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
    const folder = formData.get("folder")?.toString() || "brand-icons";
    const timestamp = Math.round(Date.now() / 1e3);
    const paramsToSign = new URLSearchParams();
    paramsToSign.set("folder", folder);
    paramsToSign.set("timestamp", String(timestamp));
    const sortedKeys = Array.from(paramsToSign.keys()).sort();
    const signatureString = sortedKeys.map((k) => `${k}=${paramsToSign.get(k)}`).join("&") + apiSecret;
    const encoder = new TextEncoder();
    const signatureBuffer = await crypto.subtle.digest(
      "SHA-1",
      encoder.encode(signatureString)
    );
    const signature = Array.from(new Uint8Array(signatureBuffer)).map((b) => b.toString(16).padStart(2, "0")).join("");
    const cloudinaryForm = new FormData();
    cloudinaryForm.set("file", file);
    cloudinaryForm.set("folder", folder);
    cloudinaryForm.set("timestamp", String(timestamp));
    cloudinaryForm.set("api_key", apiKey);
    cloudinaryForm.set("signature", signature);
    const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
    const uploadResponse = await fetch(uploadUrl, {
      method: "POST",
      body: cloudinaryForm
    });
    const result = await uploadResponse.json();
    if (!uploadResponse.ok) {
      console.error("[Cloudflare Function] Cloudinary upload failed:", result);
      return new Response(
        JSON.stringify({ error: "Cloudinary upload failed", details: result }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
    if (!result.secure_url) {
      return new Response(
        JSON.stringify({ error: "Cloudinary returned no URL" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
    return new Response(JSON.stringify({ secure_url: result.secure_url }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("[Cloudflare Function] Upload error:", error);
    return new Response(
      JSON.stringify({ error: error?.message ?? "Internal error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
__name(onRequest2, "onRequest");

// blog.ts
async function onRequest3(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const locale = url.searchParams.get("locale") || "en";
  const apiUrl = new URL(request.url);
  apiUrl.pathname = "/api/data";
  apiUrl.search = `?resource=blog&locale=${encodeURIComponent(locale)}`;
  const upstream = await fetch(apiUrl.toString(), {
    method: request.method,
    headers: request.headers,
    body: request.method !== "GET" && request.method !== "HEAD" ? request.body : null
  });
  return new Response(upstream.body, {
    status: upstream.status,
    statusText: upstream.statusText,
    headers: upstream.headers
  });
}
__name(onRequest3, "onRequest");

// init-data.ts
var normalizeJsonBinUrl2 = /* @__PURE__ */ __name((binDefinition) => {
  if (!binDefinition || !binDefinition.trim()) return null;
  const trimmed = binDefinition.trim();
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed.replace(/\/latest\/?$/i, "/latest");
  }
  return `https://api.jsonbin.io/v3/b/${trimmed}/latest`;
}, "normalizeJsonBinUrl");
var createErrorResponse2 = /* @__PURE__ */ __name((message, status = 400) => new Response(JSON.stringify({ error: message }), {
  status,
  headers: { "Content-Type": "application/json" }
}), "createErrorResponse");
var jsonBinFetch2 = /* @__PURE__ */ __name(async (url, masterKey) => {
  const headers = {
    Accept: "application/json"
  };
  if (masterKey) {
    headers["X-Master-Key"] = masterKey;
  }
  const response = await fetch(url, {
    method: "GET",
    headers,
    cache: "no-cache"
  });
  if (!response.ok) {
    throw new Error(`JSONBin fetch failed for ${url} with status ${response.status}`);
  }
  return await response.json();
}, "jsonBinFetch");
var buildResourceEntries = /* @__PURE__ */ __name((env) => {
  return [
    { resource: "brand", envKey: "VITE_JSONBIN_BRAND_BIN_ID" },
    { resource: "transfer-config", envKey: "VITE_JSONBIN_TRANSFER_BIN_ID" },
    { resource: "social-media", envKey: "VITE_JSONBIN_SOCIAL_BIN_ID" },
    { resource: "testimonials", envKey: "VITE_JSONBIN_TESTIMONIALS_BIN_ID" },
    { resource: "blog", envKey: { en: "VITE_JSONBIN_BLOG_EN", es: "VITE_JSONBIN_BLOG_ES" } },
    { resource: "tours", envKey: { en: "VITE_JSONBIN_TOURS_EN", es: "VITE_JSONBIN_TOURS_ES" } },
    { resource: "transport-services", envKey: { en: "VITE_JSONBIN_TRANSPORT_EN", es: "VITE_JSONBIN_TRANSPORT_ES" } },
    { resource: "example-tours", envKey: { en: "VITE_JSONBIN_EXAMPLETESTOURS_EN_BIN_ID", es: "VITE_JSONBIN_EXAMPLETESTOURS_ES_BIN_ID" } },
    { resource: "story-elements", envKey: { en: "VITE_JSONBIN_STORY_ELEMENTS_EN", es: "VITE_JSONBIN_STORY_ELEMENTS_ES" } },
    { resource: "intro-story", envKey: { en: "VITE_JSONBIN_JOURNEY_EN", es: "VITE_JSONBIN_JOURNEY_ES" } },
    { resource: "translations", envKey: { en: "VITE_JSONBIN_EN_BIN_ID", es: "VITE_JSONBIN_ES_BIN_ID" } }
  ];
}, "buildResourceEntries");
var saveToKV = /* @__PURE__ */ __name(async (env, key, payload) => {
  const dataKV = env.DATA_KV_F ?? env.DATA_KV;
  if (!dataKV || typeof dataKV.put !== "function") {
    throw new Error("DATA_KV_F or DATA_KV namespace binding is not configured. Please bind a Cloudflare KV namespace to DATA_KV_F or DATA_KV.");
  }
  await dataKV.put(key, JSON.stringify(payload));
}, "saveToKV");
async function onRequest4(context) {
  const { request, env } = context;
  const secretHeader = request.headers.get("x-init-secret") || "";
  const expectedSecret = env.INIT_DATA_SECRET;
  if (request.method !== "POST") {
    return createErrorResponse2("Only POST requests are allowed.", 405);
  }
  if (!expectedSecret) {
    return createErrorResponse2("INIT_DATA_SECRET is not configured in Cloudflare environment.", 500);
  }
  if (secretHeader !== expectedSecret) {
    return createErrorResponse2("Invalid initialization secret.", 401);
  }
  const dataKV = env.DATA_KV_F ?? env.DATA_KV;
  if (!dataKV || typeof dataKV.put !== "function") {
    return createErrorResponse2("DATA_KV_F or DATA_KV namespace binding is not configured. This initializer requires a Cloudflare KV namespace bound to DATA_KV_F or DATA_KV.", 500);
  }
  const masterKey = env.VITE_JSONBIN_MASTER_KEY;
  const entries = buildResourceEntries(env);
  const results = [];
  for (const entry of entries) {
    try {
      if (typeof entry.envKey === "string") {
        const binUrl = normalizeJsonBinUrl2(env[entry.envKey]);
        if (!binUrl) {
          results.push({ key: entry.resource, status: "skipped", message: `${entry.envKey} not configured` });
          continue;
        }
        const payload = await jsonBinFetch2(binUrl, masterKey);
        await saveToKV(env, entry.resource, payload);
        results.push({ key: entry.resource, status: "stored" });
        continue;
      }
      for (const locale of ["en", "es"]) {
        const envKey = entry.envKey[locale];
        const binUrl = normalizeJsonBinUrl2(env[envKey]);
        const resourceKey = `${entry.resource}-${locale}`;
        if (!binUrl) {
          results.push({ key: resourceKey, status: "skipped", message: `${envKey} not configured` });
          continue;
        }
        const payload = await jsonBinFetch2(binUrl, masterKey);
        await saveToKV(env, resourceKey, payload);
        results.push({ key: resourceKey, status: "stored" });
      }
    } catch (error) {
      results.push({ key: typeof entry.envKey === "string" ? entry.resource : `${entry.resource}-*`, status: "error", message: String(error?.message || error) });
    }
  }
  return new Response(JSON.stringify({ success: true, results }, null, 2), {
    status: 200,
    headers: { "Content-Type": "application/json" }
  });
}
__name(onRequest4, "onRequest");

// _middleware.ts
var CANONICAL_HOST = "ferreras.tours";
var REDIRECT_STATUS = 301;
async function onRequest5(context) {
  const { request, next } = context;
  const url = new URL(request.url);
  const host = url.hostname;
  if (host !== CANONICAL_HOST) {
    const redirectUrl = `https://${CANONICAL_HOST}${url.pathname}${url.search}`;
    return Response.redirect(redirectUrl, REDIRECT_STATUS);
  }
  return next();
}
__name(onRequest5, "onRequest");

// ../.wrangler/tmp/pages-gAh9SD/functionsRoutes-0.29784019956960206.mjs
var routes = [
  {
    routePath: "/api/data",
    mountPath: "/api",
    method: "",
    middlewares: [],
    modules: [onRequest]
  },
  {
    routePath: "/api/upload",
    mountPath: "/api",
    method: "",
    middlewares: [],
    modules: [onRequest2]
  },
  {
    routePath: "/blog",
    mountPath: "/",
    method: "",
    middlewares: [],
    modules: [onRequest3]
  },
  {
    routePath: "/init-data",
    mountPath: "/",
    method: "",
    middlewares: [],
    modules: [onRequest4]
  },
  {
    routePath: "/",
    mountPath: "/",
    method: "",
    middlewares: [onRequest5],
    modules: []
  }
];

// ../../../.npm/_npx/32026684e21afda6/node_modules/path-to-regexp/dist.es2015/index.js
function lexer(str) {
  var tokens = [];
  var i = 0;
  while (i < str.length) {
    var char = str[i];
    if (char === "*" || char === "+" || char === "?") {
      tokens.push({ type: "MODIFIER", index: i, value: str[i++] });
      continue;
    }
    if (char === "\\") {
      tokens.push({ type: "ESCAPED_CHAR", index: i++, value: str[i++] });
      continue;
    }
    if (char === "{") {
      tokens.push({ type: "OPEN", index: i, value: str[i++] });
      continue;
    }
    if (char === "}") {
      tokens.push({ type: "CLOSE", index: i, value: str[i++] });
      continue;
    }
    if (char === ":") {
      var name = "";
      var j = i + 1;
      while (j < str.length) {
        var code = str.charCodeAt(j);
        if (
          // `0-9`
          code >= 48 && code <= 57 || // `A-Z`
          code >= 65 && code <= 90 || // `a-z`
          code >= 97 && code <= 122 || // `_`
          code === 95
        ) {
          name += str[j++];
          continue;
        }
        break;
      }
      if (!name)
        throw new TypeError("Missing parameter name at ".concat(i));
      tokens.push({ type: "NAME", index: i, value: name });
      i = j;
      continue;
    }
    if (char === "(") {
      var count = 1;
      var pattern = "";
      var j = i + 1;
      if (str[j] === "?") {
        throw new TypeError('Pattern cannot start with "?" at '.concat(j));
      }
      while (j < str.length) {
        if (str[j] === "\\") {
          pattern += str[j++] + str[j++];
          continue;
        }
        if (str[j] === ")") {
          count--;
          if (count === 0) {
            j++;
            break;
          }
        } else if (str[j] === "(") {
          count++;
          if (str[j + 1] !== "?") {
            throw new TypeError("Capturing groups are not allowed at ".concat(j));
          }
        }
        pattern += str[j++];
      }
      if (count)
        throw new TypeError("Unbalanced pattern at ".concat(i));
      if (!pattern)
        throw new TypeError("Missing pattern at ".concat(i));
      tokens.push({ type: "PATTERN", index: i, value: pattern });
      i = j;
      continue;
    }
    tokens.push({ type: "CHAR", index: i, value: str[i++] });
  }
  tokens.push({ type: "END", index: i, value: "" });
  return tokens;
}
__name(lexer, "lexer");
function parse(str, options) {
  if (options === void 0) {
    options = {};
  }
  var tokens = lexer(str);
  var _a = options.prefixes, prefixes = _a === void 0 ? "./" : _a, _b = options.delimiter, delimiter = _b === void 0 ? "/#?" : _b;
  var result = [];
  var key = 0;
  var i = 0;
  var path = "";
  var tryConsume = /* @__PURE__ */ __name(function(type) {
    if (i < tokens.length && tokens[i].type === type)
      return tokens[i++].value;
  }, "tryConsume");
  var mustConsume = /* @__PURE__ */ __name(function(type) {
    var value2 = tryConsume(type);
    if (value2 !== void 0)
      return value2;
    var _a2 = tokens[i], nextType = _a2.type, index = _a2.index;
    throw new TypeError("Unexpected ".concat(nextType, " at ").concat(index, ", expected ").concat(type));
  }, "mustConsume");
  var consumeText = /* @__PURE__ */ __name(function() {
    var result2 = "";
    var value2;
    while (value2 = tryConsume("CHAR") || tryConsume("ESCAPED_CHAR")) {
      result2 += value2;
    }
    return result2;
  }, "consumeText");
  var isSafe = /* @__PURE__ */ __name(function(value2) {
    for (var _i = 0, delimiter_1 = delimiter; _i < delimiter_1.length; _i++) {
      var char2 = delimiter_1[_i];
      if (value2.indexOf(char2) > -1)
        return true;
    }
    return false;
  }, "isSafe");
  var safePattern = /* @__PURE__ */ __name(function(prefix2) {
    var prev = result[result.length - 1];
    var prevText = prefix2 || (prev && typeof prev === "string" ? prev : "");
    if (prev && !prevText) {
      throw new TypeError('Must have text between two parameters, missing text after "'.concat(prev.name, '"'));
    }
    if (!prevText || isSafe(prevText))
      return "[^".concat(escapeString(delimiter), "]+?");
    return "(?:(?!".concat(escapeString(prevText), ")[^").concat(escapeString(delimiter), "])+?");
  }, "safePattern");
  while (i < tokens.length) {
    var char = tryConsume("CHAR");
    var name = tryConsume("NAME");
    var pattern = tryConsume("PATTERN");
    if (name || pattern) {
      var prefix = char || "";
      if (prefixes.indexOf(prefix) === -1) {
        path += prefix;
        prefix = "";
      }
      if (path) {
        result.push(path);
        path = "";
      }
      result.push({
        name: name || key++,
        prefix,
        suffix: "",
        pattern: pattern || safePattern(prefix),
        modifier: tryConsume("MODIFIER") || ""
      });
      continue;
    }
    var value = char || tryConsume("ESCAPED_CHAR");
    if (value) {
      path += value;
      continue;
    }
    if (path) {
      result.push(path);
      path = "";
    }
    var open = tryConsume("OPEN");
    if (open) {
      var prefix = consumeText();
      var name_1 = tryConsume("NAME") || "";
      var pattern_1 = tryConsume("PATTERN") || "";
      var suffix = consumeText();
      mustConsume("CLOSE");
      result.push({
        name: name_1 || (pattern_1 ? key++ : ""),
        pattern: name_1 && !pattern_1 ? safePattern(prefix) : pattern_1,
        prefix,
        suffix,
        modifier: tryConsume("MODIFIER") || ""
      });
      continue;
    }
    mustConsume("END");
  }
  return result;
}
__name(parse, "parse");
function match(str, options) {
  var keys = [];
  var re = pathToRegexp(str, keys, options);
  return regexpToFunction(re, keys, options);
}
__name(match, "match");
function regexpToFunction(re, keys, options) {
  if (options === void 0) {
    options = {};
  }
  var _a = options.decode, decode = _a === void 0 ? function(x) {
    return x;
  } : _a;
  return function(pathname) {
    var m = re.exec(pathname);
    if (!m)
      return false;
    var path = m[0], index = m.index;
    var params = /* @__PURE__ */ Object.create(null);
    var _loop_1 = /* @__PURE__ */ __name(function(i2) {
      if (m[i2] === void 0)
        return "continue";
      var key = keys[i2 - 1];
      if (key.modifier === "*" || key.modifier === "+") {
        params[key.name] = m[i2].split(key.prefix + key.suffix).map(function(value) {
          return decode(value, key);
        });
      } else {
        params[key.name] = decode(m[i2], key);
      }
    }, "_loop_1");
    for (var i = 1; i < m.length; i++) {
      _loop_1(i);
    }
    return { path, index, params };
  };
}
__name(regexpToFunction, "regexpToFunction");
function escapeString(str) {
  return str.replace(/([.+*?=^!:${}()[\]|/\\])/g, "\\$1");
}
__name(escapeString, "escapeString");
function flags(options) {
  return options && options.sensitive ? "" : "i";
}
__name(flags, "flags");
function regexpToRegexp(path, keys) {
  if (!keys)
    return path;
  var groupsRegex = /\((?:\?<(.*?)>)?(?!\?)/g;
  var index = 0;
  var execResult = groupsRegex.exec(path.source);
  while (execResult) {
    keys.push({
      // Use parenthesized substring match if available, index otherwise
      name: execResult[1] || index++,
      prefix: "",
      suffix: "",
      modifier: "",
      pattern: ""
    });
    execResult = groupsRegex.exec(path.source);
  }
  return path;
}
__name(regexpToRegexp, "regexpToRegexp");
function arrayToRegexp(paths, keys, options) {
  var parts = paths.map(function(path) {
    return pathToRegexp(path, keys, options).source;
  });
  return new RegExp("(?:".concat(parts.join("|"), ")"), flags(options));
}
__name(arrayToRegexp, "arrayToRegexp");
function stringToRegexp(path, keys, options) {
  return tokensToRegexp(parse(path, options), keys, options);
}
__name(stringToRegexp, "stringToRegexp");
function tokensToRegexp(tokens, keys, options) {
  if (options === void 0) {
    options = {};
  }
  var _a = options.strict, strict = _a === void 0 ? false : _a, _b = options.start, start = _b === void 0 ? true : _b, _c = options.end, end = _c === void 0 ? true : _c, _d = options.encode, encode = _d === void 0 ? function(x) {
    return x;
  } : _d, _e = options.delimiter, delimiter = _e === void 0 ? "/#?" : _e, _f = options.endsWith, endsWith = _f === void 0 ? "" : _f;
  var endsWithRe = "[".concat(escapeString(endsWith), "]|$");
  var delimiterRe = "[".concat(escapeString(delimiter), "]");
  var route = start ? "^" : "";
  for (var _i = 0, tokens_1 = tokens; _i < tokens_1.length; _i++) {
    var token = tokens_1[_i];
    if (typeof token === "string") {
      route += escapeString(encode(token));
    } else {
      var prefix = escapeString(encode(token.prefix));
      var suffix = escapeString(encode(token.suffix));
      if (token.pattern) {
        if (keys)
          keys.push(token);
        if (prefix || suffix) {
          if (token.modifier === "+" || token.modifier === "*") {
            var mod = token.modifier === "*" ? "?" : "";
            route += "(?:".concat(prefix, "((?:").concat(token.pattern, ")(?:").concat(suffix).concat(prefix, "(?:").concat(token.pattern, "))*)").concat(suffix, ")").concat(mod);
          } else {
            route += "(?:".concat(prefix, "(").concat(token.pattern, ")").concat(suffix, ")").concat(token.modifier);
          }
        } else {
          if (token.modifier === "+" || token.modifier === "*") {
            throw new TypeError('Can not repeat "'.concat(token.name, '" without a prefix and suffix'));
          }
          route += "(".concat(token.pattern, ")").concat(token.modifier);
        }
      } else {
        route += "(?:".concat(prefix).concat(suffix, ")").concat(token.modifier);
      }
    }
  }
  if (end) {
    if (!strict)
      route += "".concat(delimiterRe, "?");
    route += !options.endsWith ? "$" : "(?=".concat(endsWithRe, ")");
  } else {
    var endToken = tokens[tokens.length - 1];
    var isEndDelimited = typeof endToken === "string" ? delimiterRe.indexOf(endToken[endToken.length - 1]) > -1 : endToken === void 0;
    if (!strict) {
      route += "(?:".concat(delimiterRe, "(?=").concat(endsWithRe, "))?");
    }
    if (!isEndDelimited) {
      route += "(?=".concat(delimiterRe, "|").concat(endsWithRe, ")");
    }
  }
  return new RegExp(route, flags(options));
}
__name(tokensToRegexp, "tokensToRegexp");
function pathToRegexp(path, keys, options) {
  if (path instanceof RegExp)
    return regexpToRegexp(path, keys);
  if (Array.isArray(path))
    return arrayToRegexp(path, keys, options);
  return stringToRegexp(path, keys, options);
}
__name(pathToRegexp, "pathToRegexp");

// ../../../.npm/_npx/32026684e21afda6/node_modules/wrangler/templates/pages-template-worker.ts
var escapeRegex = /[.+?^${}()|[\]\\]/g;
function* executeRequest(request) {
  const requestPath = new URL(request.url).pathname;
  for (const route of [...routes].reverse()) {
    if (route.method && route.method !== request.method) {
      continue;
    }
    const routeMatcher = match(route.routePath.replace(escapeRegex, "\\$&"), {
      end: false
    });
    const mountMatcher = match(route.mountPath.replace(escapeRegex, "\\$&"), {
      end: false
    });
    const matchResult = routeMatcher(requestPath);
    const mountMatchResult = mountMatcher(requestPath);
    if (matchResult && mountMatchResult) {
      for (const handler of route.middlewares.flat()) {
        yield {
          handler,
          params: matchResult.params,
          path: mountMatchResult.path
        };
      }
    }
  }
  for (const route of routes) {
    if (route.method && route.method !== request.method) {
      continue;
    }
    const routeMatcher = match(route.routePath.replace(escapeRegex, "\\$&"), {
      end: true
    });
    const mountMatcher = match(route.mountPath.replace(escapeRegex, "\\$&"), {
      end: false
    });
    const matchResult = routeMatcher(requestPath);
    const mountMatchResult = mountMatcher(requestPath);
    if (matchResult && mountMatchResult && route.modules.length) {
      for (const handler of route.modules.flat()) {
        yield {
          handler,
          params: matchResult.params,
          path: matchResult.path
        };
      }
      break;
    }
  }
}
__name(executeRequest, "executeRequest");
var pages_template_worker_default = {
  async fetch(originalRequest, env, workerContext) {
    let request = originalRequest;
    const handlerIterator = executeRequest(request);
    let data = {};
    let isFailOpen = false;
    const next = /* @__PURE__ */ __name(async (input, init) => {
      if (input !== void 0) {
        let url = input;
        if (typeof input === "string") {
          url = new URL(input, request.url).toString();
        }
        request = new Request(url, init);
      }
      const result = handlerIterator.next();
      if (result.done === false) {
        const { handler, params, path } = result.value;
        const context = {
          request: new Request(request.clone()),
          functionPath: path,
          next,
          params,
          get data() {
            return data;
          },
          set data(value) {
            if (typeof value !== "object" || value === null) {
              throw new Error("context.data must be an object");
            }
            data = value;
          },
          env,
          waitUntil: workerContext.waitUntil.bind(workerContext),
          passThroughOnException: /* @__PURE__ */ __name(() => {
            isFailOpen = true;
          }, "passThroughOnException")
        };
        const response = await handler(context);
        if (!(response instanceof Response)) {
          throw new Error("Your Pages function should return a Response");
        }
        return cloneResponse(response);
      } else if ("ASSETS") {
        const response = await env["ASSETS"].fetch(request);
        return cloneResponse(response);
      } else {
        const response = await fetch(request);
        return cloneResponse(response);
      }
    }, "next");
    try {
      return await next();
    } catch (error) {
      if (isFailOpen) {
        const response = await env["ASSETS"].fetch(request);
        return cloneResponse(response);
      }
      throw error;
    }
  }
};
var cloneResponse = /* @__PURE__ */ __name((response) => (
  // https://fetch.spec.whatwg.org/#null-body-status
  new Response(
    [101, 204, 205, 304].includes(response.status) ? null : response.body,
    response
  )
), "cloneResponse");
export {
  pages_template_worker_default as default
};
