export type LocationPageConfig = {
  slug: string;
  city: string;
  label: string;
  heading: string;
  headingHighlight?: string;
  summary: string;
  trust: readonly string[];
  eta?: {
    enabled: boolean;
    minutes: number;
    operationalEvidenceConfirmed: boolean;
    qualification: string;
  };
  metaTitle: string;
  metaDescription: string;
  whatsappMessage: string;
  services: readonly {
    id: 'emergency' | 'transport' | 'auction';
    heading: string;
    items: readonly string[];
    note: string;
  }[];
  coverage: {
    heading: string;
    introduction: string;
    areas: readonly string[];
    initialCount: number;
  };
  faqs: readonly { question: string; answer: string; link?: { href: string; label: string } }[];
  introduction: string;
  details: readonly { heading: string; text: string }[];
  availabilityNote: string;
};

// Only published cities belong here. Adding a city reuses the page and metadata builder;
// add its two explicit Netlify routes as well. Do not add speculative service locations.
export const locationPages: readonly LocationPageConfig[] = [
  {
    slug: 'birmingham',
    city: 'Birmingham',
    label: 'Vehicle & Breakdown Recovery',
    heading: 'Broken Down in Birmingham? Get Recovery Now.',
    headingHighlight: 'Get Recovery Now.',
    summary: "Need vehicle recovery? Call for a quote and estimated arrival time. We'll confirm availability and the price before booking.",
    trust: ['No membership required', 'Price before booking'],
    // A previous individual arrival does not establish a typical ETA. Keep hidden
    // until the owner supplies a supportable operational basis and approves its use.
    eta: { enabled: false, minutes: 30, operationalEvidenceConfirmed: false, qualification: 'Subject to availability' },
    metaTitle: 'Emergency Car Recovery Birmingham | Teleport Recovery',
    metaDescription: 'Need car or breakdown recovery in Birmingham? Contact Teleport Recovery for an upfront quote, availability and an estimated arrival time. Scheduled transport also available.',
    whatsappMessage: 'Hi Teleport Recovery, I need vehicle recovery in Birmingham.\n\nPickup postcode:\nDestination:\nVehicle:\nIs it urgent?:\n\nCould I please get a quote and estimated arrival time?',
    services: [
      {
        id: 'emergency',
        heading: 'Emergency Recovery',
        items: ['Breakdown recovery', 'Non-running vehicle recovery', 'Urgent car towing', 'Recovery requiring a suitable transporter'],
        note: 'Call for availability, an upfront quote and an estimated arrival time. We check the vehicle and loading requirements before booking.',
      },
      {
        id: 'transport',
        heading: 'Scheduled Vehicle Transport',
        items: ['Planned vehicle collections', 'Transport between locations', 'Non-urgent recovery bookings'],
        note: 'Tell us your preferred collection date, pickup and destination so we can check a suitable operator.',
      },
      {
        id: 'auction',
        heading: 'Auction Collections',
        items: ['Suitable vehicle collection from auction facilities', 'Collection and delivery by an appropriate independent operator'],
        note: 'Availability, auction release arrangements and vehicle-loading requirements are checked before booking.',
      },
    ],
    coverage: {
      heading: 'Vehicle Recovery Across Birmingham & Surrounding Areas',
      introduction: 'We can check vehicle-recovery availability across Birmingham and nearby areas. Contact us with your pickup location for a quote.',
      // Owner to confirm these enquiry areas before publication; no immediate availability is promised.
      areas: ['Birmingham City Centre', 'Digbeth', 'Aston', 'Erdington', 'Sutton Coldfield', 'Perry Barr', 'Handsworth', 'Edgbaston', 'Selly Oak', 'Harborne', 'Moseley', 'Kings Heath', 'Northfield', 'Longbridge', 'Yardley', 'Acocks Green', 'Hall Green', 'Small Heath', 'Solihull', 'Smethwick', 'West Bromwich', 'Walsall'],
      initialCount: 8,
    },
    faqs: [
      {
        question: 'What do you need for a Birmingham recovery quote?',
        answer: 'Your pickup postcode or road and landmark, destination, vehicle make and model, and whether it can roll or steer. Tell us if it is urgent and about damage or access restrictions. We check availability and confirm the price and estimated arrival time before booking.',
      },
      {
        question: 'Can you collect from a Birmingham city-centre car park?',
        answer: 'Tell us the car park name, entrance, level, height restrictions and where the vehicle is parked. Access and suitable loading equipment need to be checked with an independent operator before a collection can be agreed.',
      },
      {
        question: 'Can you take a non-running car to a garage outside Birmingham?',
        answer: 'We can check this journey with a suitable independent operator. Give us the destination postcode and explain whether the vehicle can roll, steer or has damage. Not every vehicle or loading situation can be accommodated; suitability is checked before booking.',
      },
      {
        question: 'Can I book scheduled transport or an auction collection?',
        answer: 'Yes, you can enquire about a planned collection from Birmingham or a suitable auction facility. Include the collection date, vehicle details and delivery address. For auctions, have the release information, collection window and loading requirements ready; we confirm availability before booking.',
      },
      {
        question: 'Is my arrival time or refund guaranteed?',
        answer: 'Arrival times are estimates and depend on the operator’s location, suitable equipment, traffic and confirmed availability. The money-back guarantee concerns inability to provide the agreed recovery after Teleport accepts payment, subject to its eligibility conditions and exclusions. It is not an unconditional refund or an arrival-time guarantee.',
        link: { href: '/guarantee', label: 'Read the full money-back guarantee' },
      },
    ],
    introduction: 'For a recovery enquiry in Birmingham, start with where the vehicle is and where it needs to go. These details help us check whether a suitable independent recovery operator is available for your journey.',
    details: [
      {
        heading: 'Pinpoint your Birmingham pickup',
        text: 'Give us the postcode, road name and a nearby landmark. If the vehicle is in a car park, include the entrance, level and any height or access restrictions so we can discuss the pickup accurately.',
      },
      {
        heading: 'Describe the vehicle and situation',
        text: 'Tell us the make and model, what happened, and whether the vehicle can roll or steer. Let us know about damage or other conditions that may affect loading, so the recovery requirements can be checked before booking.',
      },
      {
        heading: 'Confirm the full journey',
        text: 'The destination could be your home, a garage or another address. If it is outside Birmingham, include the destination town or postcode so we can assess the full journey before giving you a quote.',
      },
    ],
    availabilityNote: 'Recovery is arranged through independent operators. Availability and estimated arrival times depend on the pickup, vehicle, traffic and operator availability. We confirm the available option, price and estimated arrival time with you before you decide to book.',
  },
];

export function getLocationPath(page: LocationPageConfig): string {
  return `/recovery/${page.slug}`;
}

export function getLocationEta(page: LocationPageConfig): LocationPageConfig['eta'] | undefined {
  const eta = page.eta;
  return eta?.enabled && eta.operationalEvidenceConfirmed && Number.isInteger(eta.minutes)
    && eta.minutes > 0 && eta.qualification.trim() ? eta : undefined;
}

export function getLocationPage(pathname: string): LocationPageConfig | undefined {
  const path = pathname.replace(/\/index\.html$/, '').replace(/\/+$/, '');
  return locationPages.find((page) => getLocationPath(page) === path);
}
