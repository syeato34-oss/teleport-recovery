# Legal and privacy owner inputs before launch

Reviewed: 3 October 2026.

The code adds readable `/terms`, `/guarantee` and `/privacy` pages using confirmed facts. It does not establish full legal compliance. The privacy page explains the implemented website enquiry path, but is not a complete privacy notice until the missing owner information and handling decisions below are supplied and incorporated.

## Missing business identity and contact information

- Full legal proprietor name / legal entity behind the Teleport Recovery trading name, and its legal form. A trading name alone does not identify an unconfirmed limited company or sole trader.
- Genuine geographic business / correspondence address, plus a complaints address if different.
- Genuine contact email address, including the route for written customer or privacy enquiries. No confirmed email was found in source; the previous example-domain contact must not be published.
- Company registration number, place of registration and registered office if the proprietor is an incorporated company. VAT registration number only if applicable. Do not insert these merely to fill a template.
- Confirm whether a data protection officer or representative is applicable and, if so, provide the required contact details. Identify the actual controller; do not infer that the trading name is the legal controller.

Publish the confirmed identity/contact details in the appropriate website, terms and privacy locations before launch.

## Privacy decisions and account facts to confirm

1. Confirm and document the lawful basis for each actual purpose before collecting customer data. Responding to a customer-requested callback to discuss a recovery booking may be a step requested before a contract, but that does not establish the basis for every type of enquiry, security logging, record-keeping or later use. Publish the confirmed purposes/bases and any legitimate interests relied on.
2. Set actual retention periods or meaningful decision criteria for callback submissions, spam submissions, hosting logs, booking/payment records, operator communications and complaints. Include copies exported to email or spreadsheets. Implement deletion/account housekeeping and then publish the schedule or criteria. No fixed retention time was invented.
3. Confirm Netlify account access, Forms detection and who receives/reviews submissions. Check the applicable processor agreement, service/subprocessor list, processing locations, overseas transfers and safeguards. Specify any additional actual notification/email providers; none were assumed or invented.
4. Confirm the details shared with independent recovery operators and their role in handling those details. Record appropriate arrangements and any other recipients such as the actual payment provider. No payment-provider identity or separate processor was assumed.
5. Establish an owned process for access/correction/deletion and other privacy requests and complaints. Confirm the genuine written contact route and security of identity checks; the public telephone provides a current way to enquire but does not supply a missing proprietor identity or written contact.
6. Review the existing remote Google Fonts requests and Netlify technical processing. If fonts are self-hosted or the service list changes, update `/privacy` to match. No advertising/analytics tags are installed by this task. Reassess disclosures and any consent requirement before enabling real tracking tools; the event abstraction is not consent management.
7. Confirm any additional collection outside the website: call recordings, messaging, payment details, or operational records. These were not evidenced in the repository and should not be silently added to the website privacy notice as if already known.

## Booking and consumer information

- Confirm the booking acceptance and customer-confirmation process, total quote/taxes, payment arrangements and how customers receive terms and booking details in a form they can retain.
- Confirm cancellation rules and any disclosed cancellation charges, including how an immediate/urgent recovery is requested and any applicable statutory cancellation information/acknowledgements. Do not treat the guarantee's post-dispatch cancellation exclusion as removal of statutory rights.
- Confirm an owned refund process that follows the supplied guarantee: amount paid to Teleport for the agreed booking, suitable replacement within a reasonable timeframe agreed with the customer, original payment method, initiation as soon as reasonably practicable, and statutory rights preserved. No fixed refund timing was invented.
- Confirm complaint escalation and any applicable alternative dispute resolution obligations. No arbitrary jurisdiction, liability limitation, insurance promise or operator employment relationship was inserted.
- Retain evidence supporting the claims in [CLAIMS_REGISTER.md](CLAIMS_REGISTER.md), including the methodology and records behind the 45-minute average ETA.

## Authoritative references used

- [ICO: How to write a privacy notice and what goes in it](https://ico.org.uk/for-organisations/advice-for-small-organisations/privacy-notices-and-cookies/how-to-write-a-privacy-notice-and-what-goes-in-it/) — controller contact details, collection/use, lawful basis, sharing, retention, rights and complaints must reflect actual handling. ICO notes that some guidance is being reviewed following the Data (Use and Access) Act.
- [ICO: What privacy information should we provide?](https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/individual-rights/the-right-to-be-informed/what-privacy-information-should-we-provide/) — required information varies with the actual processing and applicable circumstances.
- [GOV.UK: Distance selling](https://www.gov.uk/online-and-distance-selling-for-businesses) and [Online selling](https://www.gov.uk/online-and-distance-selling-for-businesses/online-selling) — business identity/contact/address, customer information and retainable contract information require owner confirmation for the real booking flow. Applicability and exceptions should be checked against the service actually contracted.
- [Netlify: Form submissions](https://docs.netlify.com/manage/forms/submissions/) — Netlify stores submitted form data for account review and provides deletion controls. That capability does not establish Teleport's retention policy or prove that detection/notifications are configured on the production account.

These references identify gaps and inform restrained drafting; they do not certify the business or website as legally compliant.
