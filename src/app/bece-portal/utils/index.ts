export function updateSearchParam(key: string, value: string) {
  const url = new URL(window.location.toString());

  if (url.searchParams.get(key) === value) {
    return null;
  }
  url.searchParams.set(key, value);

  window.history.pushState({}, "", url.toString());
}

export function removeSearchParam(key: string) {
  const url = new URL(window.location.href);
  url.searchParams.delete(key);

  window.history.pushState({}, "", url.toString());
}