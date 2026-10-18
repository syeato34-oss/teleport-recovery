export type RecoveryGuide = {
  id: string;
  title: string;
  description: string;
  introduction: string;
  sections: readonly { heading: string; text: string }[];
  checklist: readonly string[];
  question: string;
  answer: string;
  services: readonly string[];
  related: readonly string[];
  sources: readonly { title: string; href: string }[];
  reviewed: string;
};

const highway = { title: 'Highway Code: breakdowns and incidents', href: 'https://www.gov.uk/guidance/the-highway-code/breakdowns-and-incidents-274-to-287' };
const guideContent: readonly Omit<RecoveryGuide, 'reviewed'>[] = [
  {
    id: 'car-wont-start', title: "Car Won’t Start? Planning Recovery",
    description: 'What to tell recovery dispatch when a car will not start: symptoms, parking position, vehicle mobility and the receiving destination.',
    introduction: 'Describe what the vehicle does and where it is parked. A useful recovery quote needs more than “it will not start”.',
    sections: [
      { heading: 'Describe the symptom, without guessing the fault', text: 'Tell us whether the engine turns over, you hear clicking, or nothing happens. Mention dashboard messages and what happened before the car stopped. Several faults can produce similar symptoms; an enquiry cannot establish a diagnosis.' },
      { heading: 'Starting and loading are different questions', text: 'A car that will not start may still roll and steer. Say whether the keys are available, the parking brake releases and any wheel is locked. Those details help an operator check loading equipment; a recovery quote does not promise a jump-start or repair.' },
      { heading: 'Choose somewhere that can receive the car', text: 'If you want garage delivery, confirm the garage has agreed to receive it, its hours and the unloading point. Give both postcodes and explain driveway, car park or roadside access before booking.' },
    ],
    checklist: ['Make, model and relevant dashboard messages', 'Pickup entrance and any barriers or height limits', 'Whether the wheels turn and steering works', 'Destination postcode and receiving arrangements'],
    question: 'Does a recovery enquiry include finding or fixing the starting fault?',
    answer: 'No. Teleport checks a suitable recovery option and quote. Diagnosis, roadside repair and battery assistance must not be assumed to be included.',
    services: ['non-runner-recovery', 'garage-delivery'], related: ['breakdown-at-home', 'stuck-in-park-locked-wheels'],
    sources: [{ title: 'The AA: reasons a car may not start', href: 'https://www.theaa.com/breakdown-cover/advice/starting-a-car' }],
  },
  {
    id: 'breakdown-at-home', title: 'Vehicle Recovery from Home',
    description: 'Prepare a home or driveway recovery enquiry: entrance, access, vehicle position, keys, loading condition and destination arrangements.',
    introduction: 'A home pickup needs a workable loading approach as well as an address. Describe the actual entrance and vehicle position.',
    sections: [
      { heading: 'Describe the route to the vehicle', text: 'Tell us about gates, narrow approaches, parked vehicles, slopes and any height restriction. A postcode may lead to the front door while the car is behind a different entrance. Give the collection entrance explicitly.' },
      { heading: 'Explain what can and cannot move', text: 'Mention a locked wheel, steering problem, low clearance or a vehicle parked nose-in. An independent operator checks how it could be loaded. Do not move it into traffic just to make collection easier; discuss the loading arrangement first.' },
      { heading: 'Arrange permission and handover', text: 'Confirm who can authorise collection, provide the keys and receive the vehicle at its destination. If access is shared with a neighbour, landlord or managed site, agree the relevant permission before the appointment.' },
    ],
    checklist: ['Full postcode and the correct vehicle entrance', 'Gates, slopes, height limits and available approach', 'Keys, steering and whether the wheels turn', 'Who releases the vehicle and who receives it'],
    question: 'Does listing my town mean a transporter can reach every driveway?',
    answer: 'No. The vehicle position and loading approach need an individual assessment. Describe access before accepting a quote; availability does not establish that a particular loading method is possible.',
    services: ['non-runner-recovery', 'vehicle-transport'], related: ['car-wont-start', 'stuck-in-park-locked-wheels'],
    sources: [highway],
  },
  {
    id: 'stuck-in-park-locked-wheels', title: 'Stuck in Park or Locked Wheels?',
    description: 'Recovery planning for a car that will not roll normally. Explain gear selection, wheel movement, key access and loading restrictions.',
    introduction: 'Tell dispatch what is preventing the car from rolling. Equipment and vehicle-specific loading instructions must be checked.',
    sections: [
      { heading: 'Describe the restriction precisely', text: 'A selector that stays in Park, a parking brake that will not release and a damaged wheel are different problems. Say which applies, whether any wheels turn, and whether the key or electronic controls are available. Avoid treating every immobile car as the same loading job.' },
      { heading: 'Use the correct vehicle instructions', text: 'Neutral and towing procedures vary by model. For example, Ford distinguishes temporary neutral modes from modes permitted for towing. Do not assume a general internet procedure applies to your car; the operator should check the vehicle’s own instructions.' },
      { heading: 'Confirm equipment before collection', text: 'Loading aids may be needed when a car cannot roll. Describe the parking position, ground clearance and approach so a suitable operator can assess it. Do not force the selector, drag locked wheels or release restraints without a safe, agreed method.' },
    ],
    checklist: ['Make, model and the displayed gear or warning', 'Which wheels can move and whether steering works', 'Key availability and access to the cabin', 'Space, surface and obstacles around the vehicle'],
    question: 'Can a normal transporter load any locked-wheel vehicle?',
    answer: 'That cannot be assumed. Vehicle-specific procedures, loading aids and adequate access may be required. Suitability is checked before an independent operator accepts the job.',
    services: ['non-runner-recovery', 'vehicle-transport'], related: ['car-wont-start', 'electric-vehicle-recovery'],
    sources: [{ title: 'Ford owner guidance: temporary neutral is not a tow mode', href: 'https://www.fordservicecontent.com/Ford_Content/vdirsnet/OwnerManual/Home/Content?ProcUid=G2517711&Uid=G2517710&buildtype=web&countryCode=USA&div=f&languageCode=en&moidRef=G2374283&userMarket=GBR&vFilteringEnabled=False&variantid=10490' }],
  },
  {
    id: 'failed-mot-transport', title: 'Failed MOT: Planning Vehicle Transport',
    description: 'Check the MOT result and roadworthiness before planning a move. Prepare garage, collection and loading details for a transport enquiry.',
    introduction: 'Check the test result before deciding how the vehicle will leave the test station. Arrange a receiving destination before requesting transport.',
    sections: [
      { heading: 'Read the recorded result first', text: 'GOV.UK says a failed vehicle can be taken away only if its current MOT remains valid and no dangerous problems were listed; it must still meet roadworthiness standards. Otherwise, repairs are required before driving. Follow the official result guidance rather than assuming a test booking permits an unsafe journey.' },
      { heading: 'Agree collection with the test station', text: 'Provide the site entrance, release contact and collection hours. Explain the recorded defects and whether the car can roll or steer so the operator can check loading suitability. A transport enquiry is not a booking until the option and price are agreed.' },
      { heading: 'Confirm the next garage can accept it', text: 'Give the repairer’s postcode, receiving hours and handover instructions. Tell both sites about the proposed collection and delivery window. Vehicle transport does not include repair, an MOT pass or a retest appointment.' },
    ],
    checklist: ['MOT result, dangerous defects and current certificate status', 'Test-station release contact and collection hours', 'Vehicle mobility and loading restrictions', 'Receiving garage, postcode and handover arrangements'],
    question: 'Does booking transport include arranging a repair or retest?',
    answer: 'No. Agree those appointments with the garage separately. Teleport assesses collection and delivery with a suitable independent operator; availability and the price are confirmed before booking.',
    services: ['vehicle-transport', 'garage-delivery'], related: ['stuck-in-park-locked-wheels', 'car-wont-start'],
    sources: [{ title: 'GOV.UK: MOT test results and driving a failed vehicle', href: 'https://www.gov.uk/getting-an-mot/after-the-test' }],
  },
  {
    id: 'electric-vehicle-recovery', title: 'Electric Vehicle Recovery Considerations',
    description: 'Prepare an electric-vehicle recovery enquiry with the model, charge state, warnings, loading instructions and destination details.',
    introduction: 'Give the exact electric-vehicle model and its condition. Suitable loading and transport arrangements need an individual check.',
    sections: [
      { heading: 'Provide the model and relevant condition', text: 'Tell dispatch the make, model, displayed charge and whether the vehicle has power to its controls. Mention any collision, battery warning or damage. If there is immediate danger, prioritise emergency-services instructions rather than an ordinary collection.' },
      { heading: 'Manufacturer transport instructions matter', text: 'Do not assume every electric vehicle can be towed with its wheels on the road. Tesla’s Model 3 instructions, for example, specify transport methods and tightly limit Tow Mode to loading or short repositioning. Other models have their own requirements; the operator needs the applicable instructions.' },
      { heading: 'Agree equipment and destination', text: 'Explain whether the car rolls or steers, whether it is connected to a charger and any parking restrictions. A charging destination must be suitable and able to receive it. Teleport does not promise mobile charging, battery repair or support for every EV model.' },
    ],
    checklist: ['Exact make/model and displayed charge or warnings', 'Any collision or suspected battery damage', 'Key, controls, steering and wheel movement', 'Parking access and agreed receiving destination'],
    question: 'Is Tow Mode permission to tow an EV along the road?',
    answer: 'Not necessarily. The meaning and limits are model-specific. Follow the manufacturer’s transport instructions and have a suitable operator confirm the recovery method before booking.',
    services: ['non-runner-recovery', 'vehicle-transport'], related: ['stuck-in-park-locked-wheels', 'breakdown-at-home'],
    sources: [{ title: 'Tesla Model 3: instructions for transporters (model-specific example)', href: 'https://www.tesla.com/ownersmanual/model3/en_gb/GUID-FA9E3DC9-805C-45BD-A64D-C4B3F491B8C0.html' }, highway],
  },
];

export const recoveryGuides: readonly RecoveryGuide[] = guideContent.map((guide) => ({ ...guide, reviewed: '2026-10-18' }));
export const getRecoveryGuide = (id: string) => recoveryGuides.find((guide) => guide.id === id);
export const getGuidePath = (guide: RecoveryGuide) => `/advice/${guide.id}`;
