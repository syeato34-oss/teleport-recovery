import { areas, regions, type Area } from './areas';
import { siteRoutes, routeAliases } from './routes';
import { recoveryServices, cityServices } from './recoveryServices';
import { recoveryGuides } from './advice';

export function validateContent(entries: readonly Area[] = areas) {
  const errors: string[] = [];
  const unique = (values: readonly string[], label: string) => { if (new Set(values).size !== values.length) errors.push(`Duplicate ${label}`); };
  unique(entries.map((area) => area.id), 'area slug'); unique(entries.map((area) => area.name), 'area name');
  unique(siteRoutes.map((route) => route.path), 'canonical route'); unique(siteRoutes.map((route) => route.title), 'page title');
  unique(siteRoutes.map((route) => route.description), 'page description');
  unique(recoveryGuides.map((guide) => guide.id), 'guide slug');
  const ids = new Set(entries.map((area) => area.id));
  for (const area of entries) {
    const region = regions.find((item) => item.id === area.region);
    if (!region || region.country !== area.country) errors.push(`${area.id}: invalid country/region`);
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(area.id)) errors.push(`${area.id}: invalid slug`);
    if (!area.sources.length || area.sources.some((url) => !url.startsWith('https://'))) errors.push(`${area.id}: missing source notes`);
    if (area.nearby.some((id) => !ids.has(id) || id === area.id)) errors.push(`${area.id}: invalid nearby area`);
    if (area.roads.some((road) => !/^(M|A)\d+(\(M\))?$/.test(road))) errors.push(`${area.id}: invalid road reference`);
    if (area.indexing === 'indexable' && (!area.pickup || !area.access || !area.question || !area.answer || area.maturity !== 'reviewed')) errors.push(`${area.id}: incomplete authored content`);
    if (area.serviceability !== 'dispatch-check') errors.push(`${area.id}: operator capability has not been verified`);
  }
  unique(entries.filter((area) => area.pickup).map((area) => area.pickup!), 'pickup guidance');
  for (const route of siteRoutes) {
    if (!/^\/(?:[a-z0-9-]+(?:\/[a-z0-9-]+)*)?$/.test(route.path)) errors.push(`${route.path}: invalid canonical path`);
    if (!route.title || !route.description || !route.indexable) errors.push(`${route.path}: missing publication metadata`);
    if (route.breadcrumbs.some((crumb) => !siteRoutes.some((page) => page.path === crumb.href))) errors.push(`${route.path}: broken breadcrumb`);
  }
  for (const [alias, path] of Object.entries(routeAliases)) if (siteRoutes.some((route) => route.path === alias) || !siteRoutes.some((route) => route.path === path)) errors.push(`${alias}: invalid alias target`);
  for (const service of recoveryServices) {
    if (service.checks.length < 3 || !service.problem || !service.equipment || !service.quote || !service.answer) errors.push(`${service.id}: incomplete service utility`);
    if (service.related.some((id) => !recoveryServices.some((item) => item.id === id) || id === service.id)) errors.push(`${service.id}: invalid related service`);
  }
  for (const page of cityServices) if (!ids.has(page.area) || !recoveryServices.some((service) => service.id === page.service) || !page.context || page.checks.length < 3) errors.push(`${page.area}/${page.service}: incomplete local service page`);
  for (const guide of recoveryGuides) {
    if (guide.sections.length < 3 || guide.checklist.length < 3 || !guide.question || !guide.answer || guide.sources.length === 0) errors.push(`${guide.id}: incomplete guide`);
    if (guide.sources.some((source) => !source.href.startsWith('https://'))) errors.push(`${guide.id}: invalid guide source`);
    if (guide.services.some((id) => !recoveryServices.some((service) => service.id === id))) errors.push(`${guide.id}: invalid guide service`);
    if (guide.related.some((id) => !recoveryGuides.some((item) => item.id === id) || id === guide.id)) errors.push(`${guide.id}: invalid related guide`);
  }
  if (errors.length) throw Error(`Content validation failed:\n${errors.join('\n')}`);
  return { registeredAreas: entries.length, authoredAreaPages: entries.filter((area) => area.indexing === 'indexable').length, directoryOnlyAreas: entries.filter((area) => area.indexing === 'draft').length, regions: regions.length, servicePages: recoveryServices.length, cityServicePages: cityServices.length, advicePages: recoveryGuides.length, canonicalPages: siteRoutes.length };
}
