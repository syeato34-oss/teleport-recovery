# V4.1 — content expansion decisions

This is a continuation of the existing V4 architecture. No new operational coverage, fleet, depot or equipment capability has been inferred from a town name. The owner selected “I’ll supply confirmed coverage locations”; the follow-up list is pending. Additional city and city-service publication is held until those facts arrive. The completed UI and advice work does not depend on that list.

## City candidates

| Candidate | Actual V4 state | V4.1 decision |
|---|---|---|
| Dunstable, Cambridge, Bristol, London, Manchester | Already authored | Refine existing heroes/content discovery; no duplicate city page |
| Bletchley, Newport Pagnell, Sandy | Directory entries | Priority nearby expansion candidates once supplier coverage and individual pickup guidance are confirmed |
| Peterborough, Kettering, Corby, Wellingborough | Directory entries | Hold standalone publication for confirmed serviceability and source-backed local content |
| Wolverhampton, Coventry, Leicester, Nottingham | Directory entries | Hold standalone publication; do not manufacture operator anchors or numeric response times |
| Heathrow / West London | No separate authored page; London exists | Clarify exact area, restricted-site arrangements and distinct customer utility before adding a page |

Current city count remains 12 and enquiry registry count remains 133. This is not a claim that only those 12 locations can be assessed. Each of the 133 entries is an enquiry area requiring a job-specific dispatch check.

## Service and advice topics

| Customer need | Decision / canonical destination | Distinct value |
|---|---|---|
| Tow my car to a garage | Keep `/services/garage-delivery` | Receiving hours, unloading and handover; avoid a synonym-only duplicate |
| Motorway breakdown | Keep `/services/motorway-recovery` | Official safety guidance and safe/permitted recovery access |
| Car will not start | **New** `/advice/car-wont-start` | Symptom reporting versus diagnosis, rolling/steering condition and receiving garage |
| Breakdown at home | **New** `/advice/breakdown-at-home` | Actual entrance, driveways/gates/obstacles, permission and handover |
| Non-running vehicle | Keep `/services/non-runner-recovery` | Equipment and mobility checks |
| Stuck in Park / locked wheels | **New combined guide** `/advice/stuck-in-park-locked-wheels` | Different immobilisation causes; model-specific instructions; no unsafe generic release procedure |
| Accident damage | Keep `/services/accident-recovery` | Scene control, emergency needs and suitable collection conditions |
| Failed MOT | **New** `/advice/failed-mot-transport` | Current official driving-result conditions, test-station release and garage arrangements |
| EV transport | **New** `/advice/electric-vehicle-recovery` | Model-specific transport requirements; no universal towing, repair or charging offer |
| Van recovery | Keep `/services/van-recovery` | Weight/load/equipment limits remain explicit |
| No breakdown cover | Keep existing breakdown-service FAQ and hero reassurance | Membership is already addressed; a separate thin keyword page is unnecessary |

The five guides and `/advice` hub are locally indexable, prerendered and linked from relevant services and the footer. They do not announce additional specialist services. There is no mass city/service multiplication.

## Local service combinations

- Keep `/recovery/milton-keynes/breakdown-recovery` and `/recovery/bedford/non-runner-recovery`: their pickup details are distinct from their parent city overview.
- “Recovery truck Milton Keynes” and “car towing Birmingham” overlap existing equipment/recovery explanations; no duplicate synonym pages added.
- “Breakdown recovery Bedford” overlaps the parent city page and existing transport/non-runner pathways unless new useful local information is supplied.
- “Breakdown recovery Northampton” can be reconsidered with confirmed operational facts and distinctive pickup utility; no placeholder page published.
- “Van recovery Birmingham” needs genuine vehicle-weight/equipment capability confirmation; no implied universal van support.

## Competitor architecture review

The five requested public SOS 30 Mins URLs returned HTTP 200 during this pass. The fetched sitemap contains **283 URLs**, including **157 `/areas/…` URLs** and **81 `/recovery/…` URLs**. These are observed public URL counts, not evidence of rankings, indexation, conversion quality or actual fulfilment. The local research snapshot is in `qa-artifacts/v4-1/competitor/` and is not shipped in the site build.

Useful observed ideas were geographic discovery, related intent links, problem-led navigation and practical pickup preparation. Teleport now pairs the existing region/city/service hierarchy with a distinct advice hub and relevant guide links. Directory links are not counted as authored landing pages. No competitor wording, code, images, branding, colour system or contact details were used in Teleport's public implementation. Road references were not imported from the competitor.

References inspected: [home](https://sos30mins.co.uk/), [areas](https://sos30mins.co.uk/areas), [Milton Keynes](https://sos30mins.co.uk/areas/milton-keynes), [services](https://sos30mins.co.uk/services), [sitemap](https://sos30mins.co.uk/sitemap.xml). The web reader could not access them, so read-only HTTP retrieval was used to inspect the actual public HTML/XML.
