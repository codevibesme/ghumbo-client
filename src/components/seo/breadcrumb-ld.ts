/** BreadcrumbList JSON-LD for `<JsonLd>`; paths are site-relative. */
export function breadcrumbLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: `https://ghumbo.com${item.path}`,
    })),
  };
}
