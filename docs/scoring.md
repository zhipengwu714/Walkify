# Safety Scoring Methodology

> Status: Draft — to be finalised before Phase 3 implementation begins.

## Overview

Night-mode route segments are scored from 0 (least safe) to 1 (most safe). The score combines three signals:

| Signal | Weight | Rationale |
|---|---|---|
| Incident history | 50% | Most predictive of actual risk |
| Street lighting | 30% | Visibility reduces both risk and perception of risk |
| Foot traffic | 20% | Moderate activity = eyes on the street |

## Incident History

Source: NYPD CompStat open data (felony complaints).

- Raw incident counts are normalised by block length to produce incidents per 100m.
- Only incidents in the matching time window (±2 hours of departure time, same day-of-week bracket) are counted.
- Time-of-day weighting: incidents at night carry more weight than daytime incidents for night-mode scoring.

**Known limitation:** A busy block will naturally have more reported incidents. Raw counts without exposure weighting can overstate risk on high-footfall streets. Future versions should normalise by estimated pedestrian volume.

## Street Lighting

Source: NYC Open Data streetlight dataset.

- Each route segment is intersected with the streetlight point dataset.
- Segments with ≥1 streetlight per 50m are marked as "lit" (`lit = true`).
- Binary for now; future versions could weight by lux rating if data becomes available.

## Foot Traffic

Source: BestTime.app (live/forecast) + NYC Open Data pedestrian counts (baseline).

- Foot traffic is treated as a *positive* signal in night mode, up to a ceiling.
- A very high density (>0.8) is not scored higher than moderate (0.5), because very crowded areas introduce their own risks.
- Score contribution: `min(traffic, 0.6) / 0.6`

## Composite Score

```
safety_score = (incident_score * 0.5) + (lighting_score * 0.3) + (traffic_score * 0.2)
```

Where:
- `incident_score = 1 - clamp(incidents_per_100m / 5, 0, 1)`
- `lighting_score = lit ? 1.0 : 0.2`
- `traffic_score = min(density, 0.6) / 0.6`

## Transparency

Scores are derived from public data and the methodology is open. Users should treat scores as directional guidance, not guarantees. This app does not make safety guarantees.
