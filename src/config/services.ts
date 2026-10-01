import { Truck, Wrench, CarFront, PackageCheck } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface ServiceItem {
  icon: LucideIcon;
  title: string;
  description: string;
}

export const services: ServiceItem[] = [
  {
    icon: CarFront,
    title: 'Breakdown Recovery',
    description:
      'Stranded after a mechanical failure? Tell us where you are and we’ll help arrange recovery.',
  },
  {
    icon: Wrench,
    title: 'Roadside Assistance',
    description:
      'Stuck on the roadside? Call us to discuss the help you need and what’s available.',
  },
  {
    icon: Truck,
    title: 'Accident Recovery',
    description:
      'After an incident, we can help arrange safe recovery of your vehicle. Call us to talk it through.',
  },
  {
    icon: PackageCheck,
    title: 'Vehicle Transportation',
    description:
      'Need a vehicle moved from A to B? Tell us the details and we’ll help arrange transport.',
  },
];
