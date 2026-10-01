import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { faqs } from '@/config/faqs';
import { businessConfig } from '@/config/business';

export function FAQs() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faqs" className="bg-midnight py-20 lg:py-28">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <span className="section-label">Questions & Answers</span>
          <h2 className="heading-lg mt-3 text-white">Frequently Asked Questions</h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, i) => {
            const isOpen = openIndex === i;
            const triggerId = `faq-trigger-${i}`;
            const panelId = `faq-panel-${i}`;
            return (
              <div
                key={i}
                className="rounded-xl border border-divider bg-panel/30 overflow-hidden transition-colors hover:border-divider/80"
              >
                <button
                  id={triggerId}
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                >
                  <span className="text-[15px] font-semibold text-white">{faq.question}</span>
                  <ChevronDown
                    className={`h-5 w-5 shrink-0 text-accent transition-transform duration-200 ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                    aria-hidden="true"
                  />
                </button>
                <div
                  id={panelId}
                  role="region"
                  aria-labelledby={triggerId}
                  aria-hidden={!isOpen}
                  className={`grid transition-all duration-200 ${
                    isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                  }`}
                >
                  <div className="overflow-hidden">
                    <p className="px-5 pb-5 text-sm leading-relaxed text-text-muted">{faq.answer}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-10 text-center">
          <p className="text-sm text-text-muted">Still have questions?</p>
          <a href={businessConfig.phoneHref} className="btn-primary mt-4">
            Call Us — We're Happy to Help
          </a>
        </div>
      </div>
    </section>
  );
}
