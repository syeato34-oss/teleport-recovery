import { cityServices, recoveryServices, getServicePath, getRecoveryService } from '@/config/recoveryServices';
import { getArea, getAreaPath } from '@/config/areas';
import { Breadcrumbs, RecoveryActions, RecoveryAdviceLinks } from '@/components/RecoveryNavigation';

export function ServicePage({ serviceId, cityServiceKey }: { serviceId?: string; cityServiceKey?: string }) {
  const local = cityServices.find((page) => `${page.area}/${page.service}` === cityServiceKey);
  const service = getRecoveryService(local?.service ?? serviceId ?? '');
  const area = local ? getArea(local.area) : undefined;
  const path = local ? `/recovery/${cityServiceKey}` : service ? getServicePath(service) : '/services';
  const heading = local?.title ?? service?.name ?? 'Find the Right Recovery Service';
  return <>
    <section className="directory-intro bg-midnight"><div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"><Breadcrumbs path={path} /><p className="section-label">Recovery & transport</p><h1 className="heading-xl mt-3 max-w-4xl">{heading}</h1><p className="body-lg mt-5 max-w-3xl">{local?.heroSummary ?? service?.summary ?? 'Choose the situation that best describes your vehicle. We check suitable independent operators, loading requirements, price and an estimated arrival time before booking.'}</p><RecoveryActions location={local ? `city_service_${local.area}_${local.service}` : service ? `service_${service.id}` : 'services_hub'} city={area?.name} /></div></section>
    <section className="bg-midnight-2 py-12 lg:py-16"><div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      {!service ? <ul className="grid gap-5 sm:grid-cols-2">{recoveryServices.map((item) => <li key={item.id}><a href={getServicePath(item)} className="directory-card h-full"><h2 className="text-xl font-semibold text-white">{item.name}</h2><p className="mt-3 text-sm leading-relaxed text-text-muted">{item.summary}</p><span className="mt-4 inline-block text-sm text-accent-light">Requirements & enquiry →</span></a></li>)}</ul> : <div className="max-w-4xl space-y-9">
        <div><h2 className="heading-lg">When to discuss this option</h2><p className="body-lg mt-4">{service.problem}</p></div>
        {local && <div><h2 className="text-2xl font-semibold">Local pickup considerations</h2><p className="body-base mt-4">{local.introduction}</p><p className="body-base mt-4">{local.context}</p></div>}
        <div><h2 className="text-2xl font-semibold">What dispatch needs</h2><ul className="mt-4 list-disc space-y-3 pl-5 text-text-muted marker:text-accent-light">{(local?.checks ?? service.checks).map((item) => <li key={item}>{item}</li>)}</ul></div>
        <div><h2 className="text-2xl font-semibold">Access & suitable equipment</h2><p className="body-base mt-4">{service.equipment}</p></div>
        <div><h2 className="text-2xl font-semibold">What determines the quote</h2><p className="body-base mt-4">{service.quote}</p></div>
        {service.id === 'motorway-recovery' && <p className="text-sm text-text-muted">For immediate safety guidance, follow the <a className="inline-flex min-h-11 items-center text-accent-light underline underline-offset-4" href="https://www.gov.uk/guidance/the-highway-code/breakdowns-and-incidents-274-to-287">official Highway Code guidance on breakdowns and incidents</a>. If there is immediate danger, contact emergency services first.</p>}
        <div><h2 className="text-2xl font-semibold">{service.question}</h2><p className="body-base mt-4">{service.answer}</p></div>
        <nav aria-label="Related recovery services"><h2 className="text-xl font-semibold">Related options</h2><div className="mt-4 flex flex-wrap gap-3">{service.related.map((id) => <a className="directory-chip" href={getServicePath(getRecoveryService(id)!)} key={id}>{getRecoveryService(id)!.name}</a>)}{area && <a className="directory-chip" href={getAreaPath(area)}>{area.name} pickup guidance</a>}<a className="directory-chip" href="/areas">Browse recovery areas</a></div></nav>
      </div>}
      <RecoveryAdviceLinks serviceId={service?.id} />
    </div></section>
    <section className="bg-midnight py-12"><div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"><h2 className="heading-lg">Check your recovery option</h2><p className="body-base mt-4 max-w-3xl">Tell us the pickup, destination, vehicle condition and access. We coordinate independent operators; no driver is dispatched just because you open a draft or request a quote.</p><RecoveryActions location="service_final" city={area?.name} /><p className="mt-5 text-sm text-text-muted">Read our <a className="text-accent-light underline" href="/terms">booking terms</a>, <a className="text-accent-light underline" href="/privacy">privacy information</a> and <a className="text-accent-light underline" href="/guarantee">guarantee conditions</a>.</p></div></section>
  </>;
}
