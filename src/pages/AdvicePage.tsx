import { getRecoveryGuide, recoveryGuides, getGuidePath } from '@/config/advice';
import { getRecoveryService, getServicePath } from '@/config/recoveryServices';
import { Breadcrumbs, RecoveryActions } from '@/components/RecoveryNavigation';

export function AdvicePage({ guideId }: { guideId?: string }) {
  const guide = getRecoveryGuide(guideId ?? '');
  const path = guide ? getGuidePath(guide) : '/advice';
  return <>
    <section className="directory-intro bg-midnight">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <p className="section-label">Recovery planning</p>
        <h1 className="heading-xl mt-3 max-w-4xl">{guide?.title ?? 'Practical Vehicle Recovery Advice'}</h1>
        <p className="body-lg mt-5 max-w-3xl">{guide?.introduction ?? 'Prepare the details that help an operator assess your pickup. Choose guidance for the vehicle or collection situation, then check availability and a clear quote.'}</p>
        <RecoveryActions location={guide ? `advice_${guide.id}` : 'advice_hub'} />
      </div>
    </section>
    <section className="bg-midnight-2 py-12 lg:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Breadcrumbs path={path} />
        {!guide ? <ul className="grid gap-5 sm:grid-cols-2">
          {recoveryGuides.map((item) => <li key={item.id}>
            <a href={getGuidePath(item)} className="directory-card h-full">
              <h2 className="text-xl font-semibold text-white">{item.title}</h2>
              <p className="mt-3 text-sm leading-relaxed text-text-muted">{item.description}</p>
              <span className="mt-4 inline-block text-sm text-accent-light">Read pickup & transport guidance →</span>
            </a>
          </li>)}
        </ul> : <article className="max-w-4xl space-y-9">
          {guide.sections.map((section) => <section key={section.heading}>
            <h2 className="heading-lg">{section.heading}</h2>
            <p className="body-lg mt-4">{section.text}</p>
          </section>)}
          <section>
            <h2 className="text-2xl font-semibold">Details to prepare for dispatch</h2>
            <ul className="mt-4 list-disc space-y-3 pl-5 text-text-muted marker:text-accent-light">{guide.checklist.map((item) => <li key={item}>{item}</li>)}</ul>
          </section>
          <section><h2 className="text-2xl font-semibold">{guide.question}</h2><p className="body-lg mt-4">{guide.answer}</p></section>
          <nav aria-label="Relevant recovery options">
            <h2 className="text-xl font-semibold">Discuss the appropriate recovery option</h2>
            <div className="mt-4 flex flex-wrap gap-3">{guide.services.map((id) => {
              const service = getRecoveryService(id)!;
              return <a className="directory-chip" key={id} href={getServicePath(service)}>{service.name}</a>;
            })}</div>
          </nav>
          <aside className="border-l-2 border-accent/50 pl-4 text-sm leading-relaxed text-text-muted">
            <h2 className="font-semibold text-white">Sources & scope</h2>
            <p className="mt-2">Reviewed <time dateTime={guide.reviewed}>18 October 2026</time>. This is recovery-planning information, not a vehicle diagnosis or an offer of every specialist service. Follow your vehicle instructions and relevant official guidance.</p>
            <ul className="mt-3 space-y-2">{guide.sources.map((source) => <li key={source.href}><a className="inline-flex min-h-11 items-center text-accent-light underline underline-offset-4" href={source.href}>{source.title}</a></li>)}</ul>
          </aside>
          <nav aria-label="Related recovery advice"><h2 className="text-xl font-semibold">Related pickup guidance</h2><ul className="mt-4 space-y-2">{guide.related.map((id) => {
            const related = getRecoveryGuide(id)!;
            return <li key={id}><a className="inline-flex min-h-11 items-center text-accent-light underline underline-offset-4" href={getGuidePath(related)}>{related.title}</a></li>;
          })}</ul></nav>
        </article>}
      </div>
    </section>
    <section className="bg-midnight py-12"><div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <h2 className="heading-lg">Ready to discuss recovery?</h2>
      <p className="body-base mt-4 max-w-3xl">Tell us the pickup, destination, vehicle condition and access. We check a suitable independent operator, the price and an estimated arrival time before you decide to book.</p>
      <RecoveryActions location="advice_final" />
      <p className="mt-5 text-sm text-text-muted">Explore <a className="text-accent-light underline" href="/areas">recovery areas</a> or read our <a className="text-accent-light underline" href="/terms">booking terms</a>.</p>
    </div></section>
  </>;
}
