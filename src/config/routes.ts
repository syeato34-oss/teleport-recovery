import { businessConfig } from './business';
import { areas, regions, getArea, getAreaPath } from './areas';
import { locationPages, getLocationPath } from './locations';
import { recoveryServices, cityServices, getServicePath, getRecoveryService } from './recoveryServices';
import { recoveryGuides, getGuidePath, getRecoveryGuide } from './advice';

export type SiteRoute = {
  path: string; title: string; description: string; kind: 'home' | 'legal' | 'areas' | 'region' | 'location' | 'services' | 'service' | 'city-service' | 'advice' | 'guide';
  key?: string; indexable: boolean; breadcrumbs: readonly { name: string; href: string }[];
};
const home = { name: 'Home', href: '/' }, areaHub = { name: 'Recovery areas', href: '/areas' }, serviceHub = { name: 'Services', href: '/services' };
export const siteRoutes: readonly SiteRoute[] = [
  { path: '/', title: businessConfig.metaTitle, description: businessConfig.metaDescription, kind: 'home', indexable: true, breadcrumbs: [] },
  ...['terms', 'guarantee', 'privacy'].map((id): SiteRoute => ({ path: `/${id}`, title: `${id === 'terms' ? 'Terms & Conditions' : id === 'guarantee' ? 'Money-Back Guarantee' : 'Privacy Policy'} | Teleport Recovery`, description: id === 'privacy' ? 'How Teleport Recovery handles enquiries, location sharing and optional advertising measurement.' : `Read Teleport Recovery ${id === 'terms' ? 'booking terms' : 'guarantee eligibility, exclusions and refund conditions'}.`, kind: 'legal', key: id, indexable: true, breadcrumbs: [home] })),
  { path: '/areas', title: 'UK Vehicle Recovery Areas | Teleport Recovery', description: 'Browse vehicle recovery enquiry areas by region, town and city. Share your pickup and destination to check suitable operator availability.', kind: 'areas', indexable: true, breadcrumbs: [home, areaHub] },
  ...regions.map((region): SiteRoute => ({ path: `/areas/regions/${region.id}`, title: `Vehicle Recovery in ${region.name} | Teleport Recovery`, description: `${region.context} Contact Teleport for availability and a quote.`, kind: 'region', key: region.id, indexable: true, breadcrumbs: [home, areaHub, { name: region.name, href: `/areas/regions/${region.id}` }] })),
  ...locationPages.map((page): SiteRoute => {
    const area = getArea(page.slug)!;
    const region = regions.find((item) => item.id === area.region)!;
    return { path: getLocationPath(page), title: page.metaTitle, description: page.metaDescription, kind: 'location', key: page.slug, indexable: true,
      breadcrumbs: [home, areaHub, { name: region.name, href: `/areas/regions/${region.id}` }, { name: area.name, href: getAreaPath(area) }] };
  }),
  { path: '/services', title: 'Vehicle Recovery Services | Teleport Recovery', description: 'Explore breakdown recovery, non-runner collection, transport, garage delivery and other recovery enquiries. Suitability and availability checked before booking.', kind: 'services', indexable: true, breadcrumbs: [home, serviceHub] },
  ...recoveryServices.filter((service) => service.indexing === 'indexable').map((service): SiteRoute => ({ path: getServicePath(service), title: `${service.name} | Teleport Recovery`, description: service.summary, kind: 'service', key: service.id, indexable: true, breadcrumbs: [home, serviceHub, { name: service.name, href: getServicePath(service) }] })),
  ...cityServices.map((page): SiteRoute => ({ path: `/recovery/${page.area}/${page.service}`, title: `${page.title} | Teleport Recovery`, description: page.introduction, kind: 'city-service', key: `${page.area}/${page.service}`, indexable: true, breadcrumbs: [home, areaHub, { name: getArea(page.area)!.name, href: getAreaPath(getArea(page.area)!) }, { name: getRecoveryService(page.service)!.name, href: `/recovery/${page.area}/${page.service}` }] })),
  { path: '/advice', title: 'Vehicle Recovery Advice & Pickup Guides | Teleport Recovery', description: 'Practical recovery-planning guides for non-starting cars, home pickups, locked wheels, failed MOT transport and electric vehicles.', kind: 'advice', indexable: true, breadcrumbs: [home, { name: 'Recovery advice', href: '/advice' }] },
  ...recoveryGuides.map((guide): SiteRoute => ({ path: getGuidePath(guide), title: `${guide.title} | Teleport Recovery`, description: guide.description, kind: 'guide', key: guide.id, indexable: true, breadcrumbs: [home, { name: 'Recovery advice', href: '/advice' }, { name: guide.title, href: getGuidePath(guide) }] })),
];
export const routeAliases: Readonly<Record<string, string>> = {
  '/birmingham': '/recovery/birmingham', '/areas/birmingham': '/recovery/birmingham',
  ...Object.fromEntries(areas.filter((area) => area.indexing === 'indexable' && area.id !== 'birmingham').map((area) => [`/recovery/${area.id}`, getAreaPath(area)])),
};
export const normalizePath = (path: string) => path.replace(/\/index\.html$/, '').replace(/\/+$/, '') || '/';
export function getSiteRoute(path: string): SiteRoute | undefined {
  const normalized = normalizePath(path);
  return siteRoutes.find((route) => route.path === (routeAliases[normalized] ?? normalized));
}
export function structuredData(route?: SiteRoute) {
  const base = businessConfig.websiteUrl;
  const graph: object[] = [
    { '@type': 'Organization', '@id': `${base}/#organization`, name: businessConfig.tradingName, url: base, telephone: businessConfig.phoneTel, logo: `${base}/brand/tpr-mark.svg` },
    { '@type': 'WebSite', '@id': `${base}/#website`, name: businessConfig.tradingName, url: base, publisher: { '@id': `${base}/#organization` } },
  ];
  if (route?.breadcrumbs.length) graph.push({ '@type': 'BreadcrumbList', itemListElement: route.breadcrumbs.map((crumb, index) => ({ '@type': 'ListItem', position: index + 1, name: crumb.name, item: base + crumb.href })) });
  if (route && ['location', 'service', 'city-service'].includes(route.kind)) graph.push({ '@type': 'Service', name: route.title.split(' | ')[0], description: route.description, url: base + route.path, provider: { '@id': `${base}/#organization` }, areaServed: route.kind === 'service' ? ['England', 'Wales', 'Scotland'] : getArea(route.key!.split('/')[0])!.name });
  if (route?.kind === 'guide') {
    const guide = getRecoveryGuide(route.key!)!;
    graph.push({ '@type': 'Article', headline: guide.title, description: guide.description, url: base + route.path, mainEntityOfPage: base + route.path, dateModified: guide.reviewed, author: { '@id': `${base}/#organization` }, publisher: { '@id': `${base}/#organization` } });
  }
  return JSON.stringify({ '@context': 'https://schema.org', '@graph': graph }).replace(/</g, '\\u003c');
}
