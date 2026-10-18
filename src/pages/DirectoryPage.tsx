import { useState } from 'react';
import { areas, regions, getAreaPath, getArea, priorityAreaIds } from '@/config/areas';
import { Breadcrumbs, RecoveryActions } from '@/components/RecoveryNavigation';

export function DirectoryPage({ regionId }: { regionId?: string }) {
  const [query, setQuery] = useState('');
  const region = regions.find((item) => item.id === regionId);
  const grouped = region ? [region] : regions;
  const normalized = query.trim().toLocaleLowerCase('en-GB');
  const entries = areas.filter((area) => (!region || area.region === region.id) && `${area.name} ${area.region.split('-').join(' ')}`.toLocaleLowerCase('en-GB').includes(normalized));
  const path = region ? `/areas/regions/${region.id}` : '/areas';
  return <>
    <section className="directory-intro bg-midnight"><div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"><Breadcrumbs path={path} /><p className="section-label">Coverage enquiries</p><h1 className="heading-xl mt-3 max-w-4xl">{region ? `Vehicle Recovery in ${region.name}` : 'Find Your Vehicle Recovery Area'}</h1><p className="body-lg mt-5 max-w-3xl">{region?.context ?? 'Browse towns and cities or search for your pickup area. Tell us the vehicle and destination; we check suitable independent operator availability and quote the full journey.'}</p><RecoveryActions location={region ? `region_${region.id}` : 'areas_hub'} /></div></section>
    <section className="bg-midnight-2 py-12 lg:py-16"><div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      {!region && <><h2 className="heading-lg">Popular recovery areas</h2><div className="mt-5 flex flex-wrap gap-3">{priorityAreaIds.map((id) => <a className="directory-chip" href={getAreaPath(getArea(id)!)} key={id}>{getArea(id)!.name}</a>)}</div><nav aria-label="Recovery regions" className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{regions.map((item) => <a className="directory-card" href={`/areas/regions/${item.id}`} key={item.id}>{item.name} →</a>)}</nav></>}
      <div className="mt-9 max-w-xl"><label htmlFor="area-search" className="block text-base font-semibold">Search {region ? region.name : 'recovery areas'}</label><input id="area-search" type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Town, city or region" className="mt-3 w-full min-w-0 rounded-lg border border-accent/60 bg-midnight px-4 py-3 text-base" aria-describedby="area-search-results" /><p id="area-search-results" role="status" aria-live="polite" className="mt-2 text-sm text-text-muted">{entries.length} {entries.length === 1 ? 'area' : 'areas'} shown. Availability is checked for each job.</p></div>
      {entries.length === 0 && <p className="mt-6 text-text-muted">No matching area is listed. Call with your postcode; a search result is not an availability decision.</p>}
      {grouped.map((group) => {
        const matches = entries.filter((area) => area.region === group.id).sort((a, b) => a.name.localeCompare(b.name, 'en-GB'));
        if (!matches.length) return null;
        const content = <><p className="mt-3 max-w-3xl text-sm leading-relaxed text-text-muted">{group.context}</p><a href={`/areas/regions/${group.id}`} className="inline-flex min-h-11 items-center text-sm text-accent-light underline underline-offset-4">Open the {group.name} directory</a><ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{matches.map((area) => <li id={area.id} key={area.id} className="min-w-0 scroll-mt-24"><a href={getAreaPath(area)} className="directory-card"><span className="font-semibold">{area.name}</span><span className="mt-1 block text-xs text-text-muted">{area.maturity === 'reviewed' ? 'Pickup guidance & quote enquiry →' : 'Enquiry area · call to check availability'}</span></a></li>)}</ul></>;
        return region ? <section key={group.id} className="mt-9" aria-labelledby={`region-${group.id}`}><h2 id={`region-${group.id}`} className="text-2xl font-semibold">{group.name}</h2>{content}</section> : <details key={group.id} className="mt-5 rounded-xl border border-divider p-4 sm:p-5" open={!!normalized}><summary className="cursor-pointer py-2 font-semibold text-accent-light">{group.name}<span className="ml-2 text-xs font-normal text-text-muted">{matches.length} enquiry areas</span></summary>{content}</details>;
      })}
      <aside className="mt-10 max-w-3xl border-l-2 border-accent/50 pl-4 text-sm leading-relaxed text-text-muted">Listed locations are enquiry areas, not depots or verified operator stations. All entries currently require dispatch to check the specific vehicle, access and journey. Remote, island and Northern Ireland arrangements need individual confirmation. If your place is not listed, call with the pickup postcode.</aside>
    </div></section>
  </>;
}
