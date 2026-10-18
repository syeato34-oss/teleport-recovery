import { areas, regions, getArea, getAreaPath, priorityAreaIds } from '@/config/areas';
import { recoveryServices, cityServices, getServicePath } from '@/config/recoveryServices';
import { getSiteRoute } from '@/config/routes';
import { RecoveryContactActions } from '@/components/RecoveryContactActions';
import { recoveryGuides, getGuidePath } from '@/config/advice';

export function Breadcrumbs({ path }: { path: string }) {
  const route = getSiteRoute(path);
  if (!route?.breadcrumbs.length) return null;
  return <nav aria-label="Breadcrumb" className="mb-6 text-xs leading-relaxed text-text-muted"><ol className="flex flex-wrap gap-x-2 gap-y-1">{route.breadcrumbs.map((crumb, index) => <li key={crumb.href}>{index > 0 && <span className="mr-2" aria-hidden="true">/</span>}{index === route.breadcrumbs.length - 1 ? <span aria-current="page">{crumb.name}</span> : <a href={crumb.href} className="underline underline-offset-4 hover:text-white">{crumb.name}</a>}</li>)}</ol></nav>;
}
export function AreaConnections({ areaId }: { areaId: string }) {
  const area = getArea(areaId);
  if (!area) return null;
  const region = regions.find((item) => item.id === area.region)!;
  const specific = cityServices.filter((page) => page.area === areaId);
  return <section className="bg-midnight py-12" aria-labelledby="related-areas-heading"><div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
    <p className="section-label">Plan the journey</p><h2 id="related-areas-heading" className="heading-lg mt-3">Nearby areas & recovery options</h2>
    <p className="body-base mt-4 max-w-3xl">{area.roads.length ? `Relevant nearby corridors include ${area.roads.join(', ')}. Give the exact road, direction and safe stopping point; a corridor reference does not establish permitted recovery access.` : 'Give the actual street, postcode and vehicle entrance. A nearby town name helps describe the journey but does not promise immediate availability.'}</p>
    <div className="mt-6 flex flex-wrap gap-3">{area.nearby.map((id) => <a key={id} href={getAreaPath(getArea(id)!)} className="directory-chip">{getArea(id)!.name}</a>)}<a href={`/areas/regions/${area.region}`} className="directory-chip">Explore {region.name}</a></div>
    <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{recoveryServices.slice(0, 4).map((service) => <li key={service.id}><a className="inline-flex min-h-11 items-center text-accent-light underline underline-offset-4" href={getServicePath(service)}>{service.name}</a></li>)}</ul>
    {specific.map((page) => <p key={page.service} className="mt-4"><a className="inline-flex min-h-11 items-center text-accent-light underline underline-offset-4" href={`/recovery/${page.area}/${page.service}`}>{page.title}: pickup guidance</a></p>)}
  </div></section>;
}
export function NationwideCoverage() {
  return <section id="coverage" className="bg-midnight-2 py-16 lg:py-20"><div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
    <p className="section-label">Find your area</p><h2 className="heading-lg mt-3">Vehicle Recovery Across the UK</h2><p className="body-lg mt-4 max-w-3xl">From local breakdowns to longer-distance recovery, tell us where the vehicle is and where it needs to go. We'll check suitable operator availability and quote the journey.</p>
    <ul className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{priorityAreaIds.map((id) => { const area = getArea(id)!; return <li key={id}><a className="directory-card" href={getAreaPath(area)}><span className="font-semibold text-white">{area.name}</span><span className="mt-1 block text-sm text-text-muted">Pickup advice & recovery enquiries →</span></a></li>; })}</ul>
    <div className="mt-7 flex flex-wrap gap-3"><a href="/areas" className="btn-primary">Explore All Recovery Areas</a><a href="/services/motorway-recovery" className="btn-secondary">Motorway pickup guidance</a></div>
    <p className="mt-5 max-w-3xl text-sm text-text-muted">Browse {areas.length} enquiry locations across {regions.length} regional groups. Every job is subject to suitable operator availability; remote and restricted-access pickups need an individual check. Northern Ireland arrangements require confirmation.</p>
  </div></section>;
}
export function RecoveryActions({ location, city }: { location: string; city?: string }) {
  return <div className="mt-6"><RecoveryContactActions location={location} city={city} /></div>;
}

export function RecoveryAdviceLinks({ serviceId }: { serviceId?: string }) {
  const guides = serviceId ? recoveryGuides.filter((guide) => guide.services.includes(serviceId)) : recoveryGuides;
  if (!guides.length) return null;
  return <nav aria-label="Recovery planning advice" className="mt-9">
    <h2 className="text-xl font-semibold text-white">Prepare for your recovery</h2>
    <ul className="mt-4 grid gap-3 sm:grid-cols-2">{guides.map((guide) => <li key={guide.id}>
      <a className="inline-flex min-h-11 items-center text-sm text-accent-light underline underline-offset-4" href={getGuidePath(guide)}>{guide.title}</a>
    </li>)}</ul>
    <a href="/advice" className="mt-3 inline-flex min-h-11 items-center text-sm text-accent-light underline underline-offset-4">Explore all recovery advice</a>
  </nav>;
}
