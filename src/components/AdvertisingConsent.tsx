import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { getAdvertisingChoice, openAdvertisingSettings, PRIVACY_SETTINGS_EVENT, saveAdvertisingChoice, startAdvertisingConsent, subscribeAdvertisingConsent, type ConsentChoice } from '@/lib/advertisingConsent';

export function PrivacySettingsButton() {
  return <button type="button" data-privacy-settings onClick={openAdvertisingSettings} className="inline-flex min-h-11 items-center text-left hover:text-white">Advertising privacy settings</button>;
}

/** Non-modal; emergency call/navigation controls remain available above and below it. */
export function AdvertisingConsent() {
  const choice = useSyncExternalStore(subscribeAdvertisingConsent, getAdvertisingChoice, () => null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [storageError, setStorageError] = useState(false);
  const panel = useRef<HTMLElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const returnFocus = useRef<HTMLElement | null>(null);
  const visible = choice === null || settingsOpen;

  useEffect(() => {
    startAdvertisingConsent();
    const open = () => {
      returnFocus.current = document.activeElement as HTMLElement;
      setSettingsOpen(true);
    };
    window.addEventListener(PRIVACY_SETTINGS_EVENT, open);
    return () => window.removeEventListener(PRIVACY_SETTINGS_EVENT, open);
  }, []);
  useEffect(() => {
    if (settingsOpen) heading.current?.focus();
  }, [settingsOpen]);
  useEffect(() => {
    const element = panel.current;
    const root = document.documentElement;
    const measure = () => root.style.setProperty('--consent-panel-height', `${element?.getBoundingClientRect().height ?? 0}px`);
    const observer = new ResizeObserver(measure);
    if (element) observer.observe(element);
    measure();
    return () => { observer.disconnect(); root.style.removeProperty('--consent-panel-height'); };
  }, [visible]);

  const close = () => {
    setSettingsOpen(false);
    (returnFocus.current ?? document.getElementById('main-content'))?.focus({ preventScroll: true });
  };
  const save = (next: ConsentChoice) => {
    if (!saveAdvertisingChoice(next)) { setStorageError(true); return; }
    setStorageError(false);
    close();
  };
  return (
    <>
      <p role="status" className="sr-only">{choice ? `Advertising choice saved: ${choice}.` : ''}</p>
      {visible && (
        <aside ref={panel} aria-labelledby="advertising-consent-title" className="consent-panel fixed inset-x-0 z-40 overflow-y-auto border-t border-divider bg-midnight-2 px-4 py-3 text-sm text-text-muted shadow-xl" onKeyDown={(event) => { if (event.key === 'Escape' && choice !== null) close(); }}>
          <div className="mx-auto max-w-7xl lg:flex lg:items-center lg:justify-between lg:gap-8">
            <div>
              <h2 ref={heading} id="advertising-consent-title" tabIndex={-1} className="font-semibold text-white">Optional advertising measurement</h2>
              <p className="mt-1 leading-5">Allow Google Ads cookies to measure ad visits and calls?{' '}<a href="/privacy#advertising-privacy" className="text-accent-light underline underline-offset-4">Privacy details</a></p>
              {settingsOpen && <p className="mt-2 max-w-2xl text-sm leading-relaxed">Current choice: {choice === 'accepted' ? 'accepted' : choice === 'rejected' ? 'rejected' : 'not chosen'}. Calling, WhatsApp and callbacks work either way. Withdrawing after acceptance reloads this page to stop already-loaded tags.</p>}
              {storageError && <p role="alert" className="mt-2 text-white">Your browser could not save this choice. Your current setting is unchanged.</p>}
            </div>
            <div className="mt-3 grid grid-cols-[repeat(auto-fit,minmax(min(100%,8rem),1fr))] gap-3 lg:mt-0 lg:min-w-[20rem]">
              <button type="button" onClick={() => save('accepted')} className="btn-secondary min-h-11 min-w-0 break-words px-4 py-2 text-sm">Accept advertising</button>
              <button type="button" onClick={() => save('rejected')} className="btn-secondary min-h-11 min-w-0 break-words px-4 py-2 text-sm">Reject advertising</button>
              {settingsOpen && choice !== null && <button type="button" onClick={close} className="col-[1/-1] min-h-11 text-accent-light underline underline-offset-4">Close privacy settings</button>}
            </div>
          </div>
        </aside>
      )}
      <div className="h-[var(--consent-panel-height,0px)]" aria-hidden="true" />
    </>
  );
}
