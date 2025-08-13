export const onRequest = async (context) => {
  const request = context.request;
  try {
    const url = new URL(request.url);
    const path = url.pathname;
    if (path.startsWith("/api")) {
      const newUrl = new URL(request.url);
      // In practice URLs like this are used by MakeCode: https://pxt.azureedge.net/api/gh/microbit-foundation/pxt-ml-extension-poc/v0.1.23/text?cdn=20240531
      newUrl.host = "pxt.azureedge.net";
      const modifiedRequest = new Request(newUrl, request);
      return fetch(modifiedRequest);
    }
    return context.next();
  } catch (e) {
    return context.next();
  }
};
