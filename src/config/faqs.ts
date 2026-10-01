export interface FAQItem {
  question: string;
  answer: string;
}

export const faqs: FAQItem[] = [
  {
    question: 'What information should I have ready before I call?',
    answer:
      'Your current location (postcode, road name or nearby landmark), your vehicle make and model, what happened, and where you need the vehicle taken. The more you can tell us, the faster we can help.',
  },
  {
    question: 'What situations can you help with?',
    answer:
      'Breakdowns, roadside assistance, accident recovery and vehicle transportation. If your situation is unusual, call us — we can talk through what might work.',
  },
  {
    question: 'Can recovery be arranged across different UK locations?',
    answer:
      'Yes. We help arrange recovery across the UK. Tell us where you are and where the vehicle needs to go, and we’ll check what’s available for your area.',
  },
  {
    question: 'How does the quote work?',
    answer:
      'The quote depends on factors like distance, vehicle type and the nature of the recovery. We explain it before anything is arranged — you decide whether to go ahead.',
  },
  {
    question: 'How do I get in touch?',
    answer:
      'The fastest way is to call us. You can also message us on WhatsApp, or use the callback form at the bottom of this page and we’ll get back to you.',
  },
  {
    question: 'What is the money-back guarantee?',
    answer:
      'We stand behind the service we arrange. Full guarantee terms will be published here before launch — please check back or ask us when you call.',
  },
];
