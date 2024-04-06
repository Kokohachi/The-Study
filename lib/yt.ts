import Innertube, { UniversalCache, Credentials } from "youtubei.js";

const cache = new UniversalCache(false);
const yt = await Innertube.create({
  generate_session_locally: true,
  lang: "ja",
  location: "JP",
  fetch: async (input: RequestInfo | URL, init?: RequestInit) => {
    const url =
      typeof input === "string"
        ? new URL(input)
        : input instanceof URL
          ? input
          : new URL(input.url);

    // Transform the url for use with our proxy.
    url.searchParams.set("__host", url.host);
    url.host = "kokohachi.deno.dev";
    url.protocol = "https";

    const headers = init?.headers
      ? new Headers(init.headers)
      : input instanceof Request
        ? input.headers
        : new Headers();

    // Now serialize the headers.
    // @ts-ignore
    url.searchParams.set("__headers", JSON.stringify([...headers]));

    if (input instanceof Request) {
      // @ts-ignore
      input.duplex = "half";
    }

    // Copy over the request.
    const request = new Request(
      url,
      input instanceof Request ? input : undefined
    );

    headers.delete("user-agent");

    return fetch(
      request,
      init
        ? {
          ...init,
          headers,
        }
        : {
          headers,
        }
    );
    // failed to fetch

    // return fetch(request, init).then((res) => {
    //   console.log(res);
    //   return res;
    // });
  },
  cache: cache,
});

export default yt;
export { cache };
