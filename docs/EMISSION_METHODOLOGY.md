# EMISSION_METHODOLOGY.md

# Carbon Emission Methodology Specification

## Purpose

This document defines the official carbon accounting methodology used by the Carbon Footprint Awareness Platform.

This document serves as the scientific foundation for all carbon footprint calculations.

All engineers, AI agents, and future contributors must follow this methodology when implementing calculations.

---

# Guiding Principles

## Principle 1: Deterministic Calculations

All carbon calculations must be deterministic.

Given the same input and the same emission factor version:

```text id="xq0u2g"
Input A
+
Factor Version A
=
Output A
```

The result must always be reproducible.

---

## Principle 2: Transparency

Every carbon value must be explainable.

The system should always be able to answer:

```text id="xvh2cl"
Why did this user receive this footprint score?
```

---

## Principle 3: Auditability

Every footprint calculation must reference:

* emission factor
* emission factor version
* source methodology
* calculation timestamp

---

## Principle 4: Regional Accuracy

The platform is:

### India First

Calculations should prioritize Indian emission data whenever available.

Fallback hierarchy:

```text id="qv8ojw"
India Source
      ↓
IPCC
      ↓
EPA
      ↓
UK DESNZ / BEIS
```

---

# Carbon Accounting Framework

The platform follows an activity-based accounting model.

Formula:

```text id="kefjlwm"
Carbon Emissions

=

Activity Quantity

×

Emission Factor
```

---

# General Formula

```text id="bjd4a4"
CO₂e

=

Activity Amount

×

Emission Factor
```

Where:

```text id="zowfpl"
CO₂e = Carbon Dioxide Equivalent

Activity Amount = User Activity

Emission Factor = Scientific Conversion Factor
```

---

# Supported Categories

## Transportation

Tracks travel-related emissions.

Examples:

* Car
* Motorcycle
* Bus
* Metro
* Train
* Flight
* Bicycle
* Walking

---

### Formula

```text id="gm7v0h"
Distance (km)

×

Transport Emission Factor
```

Example:

```text id="s4yjgs"
15 km Car Travel

×

0.192 kg CO₂e/km

=

2.88 kg CO₂e
```

---

### Sample Factors

| Mode       | Unit | Example Factor   |
| ---------- | ---- | ---------------- |
| Car        | km   | 0.192            |
| Motorcycle | km   | 0.103            |
| Bus        | km   | 0.089            |
| Metro      | km   | Region Dependent |
| Train      | km   | Region Dependent |
| Walking    | km   | 0                |
| Bicycle    | km   | 0                |

Actual values must come from the emission_factors table.

Never hardcode production values.

---

# Food Emissions

Tracks food consumption impact.

Examples:

* Vegetarian Meal
* Chicken
* Fish
* Dairy
* Eggs
* Beef
* Packaged Food

---

### Formula

```text id="j3r8b4"
Quantity

×

Food Emission Factor
```

Example:

```text id="wx7z31"
1 Chicken Meal

×

Factor

=

CO₂e
```

---

### Food Hierarchy

Highest impact:

```text id="tbhy3h"
Beef
↓
Lamb
↓
Pork
↓
Chicken
↓
Fish
↓
Eggs
↓
Vegetarian
↓
Vegan
```

Actual values must be retrieved from emission_factors.

---

# Electricity Emissions

Tracks household electricity consumption.

---

### Formula

```text id="m0jqm4"
kWh Consumed

×

Regional Grid Factor
```

---

### Example

```text id="syl7jd"
120 kWh

×

0.708

=

84.96 kg CO₂e
```

---

# Regional Electricity Model

India's electricity grid is not uniform.

Emission intensity may vary by:

* State
* Grid Source
* Renewable Mix

The system must support:

```text id="9m76m7"
state_code
```

based factor selection.

---

# Shopping Emissions

Tracks consumer purchases.

This category uses estimation.

Examples:

* Clothing
* Electronics
* Home Goods
* Miscellaneous Purchases

---

### Formula

```text id="3lj2mx"
Quantity

×

Product Category Factor
```

---

### Important Note

Shopping calculations are estimates.

They should be marked with:

```text id="qogm9u"
confidence_score
```

inside activity events.

---

# Flight Emissions

Flights require special treatment.

Factors include:

* Distance
* Flight Type
* Radiative Forcing

---

### Formula

```text id="34a6k7"
Flight Distance

×

Flight Factor

×

Radiative Multiplier
```

---

### Flight Classes

Supported:

* Economy
* Premium Economy
* Business
* First Class

---

# Carbon Categories

Every footprint entry must belong to:

```text id="m5mn9o"
transport

food

electricity

shopping

other
```

This enables:

* dashboards
* mission generation
* AI insights

---

# Emission Factor Versioning

## Rule

Emission factors never change in-place.

---

Bad:

```text id="8ynk3v"
Update Factor
```

---

Correct:

```text id="s54jv2"
Create New Version
```

Example:

```text id="dbnncm"
INDIA_TRANSPORT_V1

INDIA_TRANSPORT_V2
```

---

# Historical Preservation

Historical footprints must preserve:

```text id="xj4cxm"
factor_version_used
```

Example:

```text id="f31lzf"
2025 Calculation

→ V1

2027 Calculation

→ V3
```

Recalculation should be optional.

Never silently rewrite history.

---

# Recalculation Policy

When emission factors change:

System may:

```text id="n8jyj3"
Recalculate Future Values
```

System should not automatically:

```text id="y7g37f"
Rewrite Historical Values
```

without explicit migration.

---

# Data Sources

Preferred sources:

## Tier 1

India-specific government and research data.

Examples:

* Central Electricity Authority (CEA)
* Bureau of Energy Efficiency (BEE)
* Ministry of Power

---

## Tier 2

International standards.

Examples:

* IPCC
* International Energy Agency (IEA)
* EPA

---

## Tier 3

Academic research papers.

Used only when better sources are unavailable.

---

# Confidence Scoring

Each activity should have:

```text id="9tvh7y"
confidence_score
```

Range:

```text id="nh5d7m"
0.0 → 1.0
```

Examples:

| Source             | Confidence |
| ------------------ | ---------- |
| Utility Bill       | 1.0        |
| Receipt OCR        | 0.95       |
| User Input         | 0.90       |
| AI Inference       | 0.70       |
| Estimated Category | 0.50       |

---

# AI Restrictions

AI is not permitted to:

* generate emission factors
* override emission factors
* calculate official carbon values
* modify historical footprint data

AI may:

* explain calculations
* summarize trends
* generate missions
* provide coaching

---

# Methodology Validation

Every footprint calculation must pass:

## Validation 1

Emission factor exists.

---

## Validation 2

Emission factor version exists.

---

## Validation 3

Activity quantity is valid.

---

## Validation 4

Result is non-negative.

---

## Validation 5

Calculation is reproducible.

---

# Future Expansion

Future categories may include:

* Water Consumption
* Waste Generation
* Public Infrastructure Usage
* Carbon Offsets

These categories are out of scope for MVP.

---

# Competition Defense Statement

If judges ask:

> Where do your carbon numbers come from?

Answer:

```text id="4ptuhm"
All carbon calculations are deterministic and based on versioned emission factors stored in the platform database.

The system follows an activity-based accounting model where emissions are calculated using:

Activity Quantity × Emission Factor

Emission factors are sourced from Indian datasets whenever available and fall back to internationally recognized sources such as IPCC and EPA standards.

Historical calculations remain auditable because every footprint record stores the factor version used during computation.
```

---

# Final Statement

The Carbon Footprint Awareness Platform treats carbon accounting as a deterministic engineering system.

The Carbon Engine is the sole authority responsible for calculating emissions.

Artificial intelligence may interpret results but is never permitted to generate official carbon values.

This separation ensures transparency, reproducibility, scientific credibility, and long-term maintainability.
