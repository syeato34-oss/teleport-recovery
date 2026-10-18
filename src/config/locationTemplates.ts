import type { Area } from './areas';
import { cityHero } from './heroes';
import { getArea } from './areas';
import type { LocationPageConfig } from './locations';

export function createAreaPage(area: Area, base: LocationPageConfig): LocationPageConfig {
  return {
    slug: area.id, path: `/areas/${area.id}`, city: area.name, label: 'Vehicle & Breakdown Recovery', locationSharingPrimary: true,
    ...cityHero(area.name),
    metaTitle: `Vehicle Recovery ${area.name} | Quotes & Availability | Teleport Recovery`,
    metaDescription: `Check vehicle recovery in ${area.name}. Share the pickup, vehicle condition and destination for suitable operator availability, an upfront quote and an arrival estimate.`,
    whatsappMessage: `Hi Teleport Recovery, I need vehicle recovery in ${area.name}.\n\nPickup postcode:\nDestination:\nVehicle:\nWhat happened:\n\nPlease check availability, price and estimated arrival time.`,
    services: base.services,
    coverage: { heading: `Recovery enquiries around ${area.name}`, introduction: 'These nearby areas help describe the journey. Each pickup needs its own availability and access check.', areas: [area.name, ...area.nearby.map((id) => getArea(id)!.name)], initialCount: 4 },
    faqs: [
      { question: area.question!, answer: area.answer! },
      { question: `What should I send for a ${area.name} quote?`, answer: area.pickup! },
      { question: 'Will you confirm the price before booking?', answer: 'Yes. We check a suitable independent operator, explain the quote and estimated arrival time, then you decide whether to book. Enquiring does not dispatch a driver.' },
      { question: 'Can I share my pickup location without GPS permission?', answer: 'Yes. Location access is optional. The WhatsApp action prepares a manual pickup field if permission is declined or unavailable. You review and send the draft yourself.' },
    ],
    introduction: area.pickup!,
    details: [
      { heading: 'Access and loading', text: area.access! },
      { heading: 'Describe the vehicle', text: 'Tell us the make, model and whether it rolls or steers. Mention locked wheels, damage, unusual size or low ground clearance so equipment suitability can be checked.' },
      { heading: 'Agree the destination', text: 'Give the destination postcode and receiving arrangements. Garage hours, site permissions and unloading access should be agreed before collection.' },
    ],
    availabilityNote: 'Teleport coordinates independent recovery operators. Every job needs a specific availability, equipment, access and price check; a listed area is not a local depot or an immediate dispatch promise.',
  };
}
