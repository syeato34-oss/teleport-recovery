// Existing functional suites test consented UI hooks without sending Google traffic.
// consent-browser-qa.mjs separately tests fresh/rejected visitors and the real library.
export async function consentedFunctionalContext(context) {
  await context.route('https://www.googletagmanager.com/gtag/js**', (route) => route.fulfill({ status: 200, contentType: 'application/javascript', body: '/* Functional QA: network-isolated Google tag. */' }));
  await context.addInitScript(() => {
    localStorage.setItem('teleport-advertising-consent', JSON.stringify({ version: 1, choice: 'accepted', updatedAt: Date.now() }));
  });
}
