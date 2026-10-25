/** Only same-site paths, so `?next=` can't send people off to another origin. */
export function safeNext(value: unknown) {
  return typeof value === "string" && value.startsWith("/") && !value.startsWith("//") && !value.startsWith("/\\")
    ? value
    : "/";
}
