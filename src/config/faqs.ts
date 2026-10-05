import { businessConfig } from '@/config/business';

export interface FAQItem {
  question: string;
  answer: string;
  link?: { href: string; label: string };
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
      `The fastest way is to call ${businessConfig.phoneDisplay}. You can also use the callback form at the bottom of this page to request a call about your recovery.`,
  },
  {
    question: 'What is the money-back guarantee?',
    answer:
      `If ${businessConfig.tradingName} accepts payment but is unable to provide the agreed recovery service, the amount paid to Teleport for that booking will be refunded. Conditions and exclusions apply; estimated arrival times are not guaranteed. Your statutory rights are unaffected.`,
    link: { href: businessConfig.guaranteeUrl, label: 'Read the full Money-Back Guarantee' },
  },
  {
    question: 'Who carries out the recovery?',
    answer:
      `${businessConfig.tradingName} manages your booking and may use independent recovery operators to carry out the physical recovery service. Teleport remains your point of contact for the booking.`,
  },
  {
    question: 'Is the average ETA a guaranteed arrival time?',
    answer:
      `No. Our ${businessConfig.averageEtaMinutes}-minute average ETA is an average, not a guaranteed arrival time. ${businessConfig.averageEtaQualifier} We’ll confirm the estimated arrival time for your booking before dispatch.`,
  },
];
