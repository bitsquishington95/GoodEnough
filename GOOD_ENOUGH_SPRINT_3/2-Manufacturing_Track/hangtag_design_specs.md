# HANGTAG DESIGN SPECIFICATIONS
**GOOD ENOUGH™ Product Authentication System**
*Version 1.5 | July, 2025*

## DESIGN INTENT & OVERVIEW

The GOOD ENOUGH™ hangtag system serves as both a product identifier and authentication mechanism, integrating our NFC technology within a minimalist design language. This document outlines the comprehensive specifications for manufacturing partners and ensures consistent execution across all product categories.

## PHYSICAL SPECIFICATIONS

### Primary Hangtag

| Specification | Measurement/Detail | Notes |
|:---|:---|:---|
| Dimensions | 60mm × 100mm | Rectangular format, portrait orientation |
| Material | 350 GSM recycled cotton paper | Natural, uncoated finish |
| Color | Raw ecru (#EDE9E0) | No bleaching agents |
| Thickness | 0.6mm | Including embedded NFC layer |
| Corner radius | 3mm | All four corners |
| Attachment | 2mm jute cord, 200mm length | Single loop connection |
| Printing | Soy-based ink, black only | Heat-set to prevent transfer |
| NFC integration | Center-embedded, 30mm diameter | Hidden within paper layer |

### Secondary Information Tag

| Specification | Measurement/Detail | Notes |
|:---|:---|:---|
| Dimensions | 40mm × 80mm | Rectangular format, portrait orientation |
| Material | Same as primary tag | Thinner stock (250 GSM) |
| Position | Attached to same cord | 25mm below primary tag |
| Content | Care instructions, materials | Region-specific compliance information |

## DESIGN ELEMENTS

### Typography

| Element | Specification | Notes |
|:---|:---|:---|
| Primary brand mark | 24pt Franklin Gothic Medium | Center top, all caps |
| Product name | 16pt Franklin Gothic Book | Center, sentence case |
| Authentication note | 8pt Franklin Gothic Book | Bottom margin, 8mm from edge |
| Product code | 6pt Franklin Gothic Condensed | Back side, bottom right corner |
| Manufacturing info | 6pt Franklin Gothic Book | Back side, bottom right, below code |

### Iconography & Graphics

| Element | Specification | Notes |
|:---|:---|:---|
| NFC scan indicator | 12mm diameter circle, 0.5pt line | Centered, minimal |
| QR code | None | Intentionally omitted |
| Borders | None | Clean edge treatment only |
| Brand mark location | Primary face, top area | 12mm from top edge |
| Material icons | Standard care symbols only | Secondary tag only |

### Color Palette

| Element | Color Specification | Notes |
|:---|:---|:---|
| Tag base | #EDE9E0 (Ecru) | Natural recycled cotton color |
| Primary text | #000000 (Black) | 100% K value, no rich black |
| Scan indicator | #000000 (Black) | 0.5pt line weight |
| NFC scan area | No printed indicator | Invisible integration |
| Limited edition indicator | #8B0000 (Deep Red) | Primary tag, small dot, right corner |

## CONTENT SPECIFICATIONS

### Primary Tag: Front

```
GOOD ENOUGH™
[12mm space]
Heavy Tee 
[8mm space]
[NFC indicator circle: minimal 0.5pt]
[8mm space]
Scan to authenticate
```

### Primary Tag: Back

```
GOOD ENOUGH™
[12mm space]
Designed in Chicago
Made in [ORIGIN COUNTRY]
[space]
[product-specific information]
[space]
goodenough.us/verify
[space]
#GE[product code]
```

### Secondary Tag: Care Instructions

Standard international care symbols arranged vertically in the following order:
- Washing instructions
- Bleaching instructions
- Drying instructions  
- Ironing instructions
- Professional cleaning instructions

Below symbols:
```
100% Organic Cotton
330 GSM
[Material composition details]
[Country of origin statement]
[Compliance information]
```

## NFC INTEGRATION SPECIFICATIONS

### Tag Placement

| Aspect | Specification | Notes |
|:---|:---|:---|
| Position | Center of primary tag | Embedded within paper layers |
| Visibility | Not visible from exterior | Seamlessly integrated |
| Tag diameter | 30mm NTAG 424 DNA | Confirmed compatible with spec |
| Accessibility | Optimal scan zone marked | Subtle 0.5pt circle indicator |
| Casing | None | Direct paper embedding |

### Functionality Requirements

| Function | Specification | Notes |
|:---|:---|:---|
| Read distance | 3-5 cm | Optimal for deliberate scanning |
| ID Storage | 32-bit unique identifier | Serialized per item |
| URL redirect | goodenough.us/verify/[product-ID] | Secure HTTPS required |
| Data transfer | 424 DNA encryption | AES-128 standard |
| Tamper evidence | Signal degradation on removal | Product authentication security |

## PRODUCTION REQUIREMENTS

### Material Sourcing

| Component | Requirement | Certification |
|:---|:---|:---|
| Paper stock | 100% post-consumer recycled | FSC certified |
| Jute cord | Natural, undyed | Organic certified |
| Printing ink | Soy-based, low VOC | SGS certified non-toxic |
| Adhesive | Water-based, PVC-free | REACH compliant |
| NFC components | RoHS compliant | NTAG 424 DNA certified |

### Quality Control Standards

| Test | Acceptance Criteria | Testing Method |
|:---|:---|:---|
| Print quality | No visible pixelation at 15cm | 10× magnification inspection |
| Color consistency | Within 5% of standard | Spectrophotometer comparison |
| NFC reliability | 100% read rate | Batch testing, all units |
| Attachment security | 5kg pull test | Random sampling (5%) |
| Material quality | No visible flaws | 100% visual inspection |
| Edge cuts | Clean, no fraying | 100% visual inspection |
| Tag flatness | No warping or curling | Lay-flat test, 24hrs |

### Environmental Considerations

| Aspect | Requirement | Notes |
|:---|:---|:---|
| Biodegradability | Tag biodegrades within 6 months | Excluding NFC component |
| Recycling | NFC chip separable for e-waste | Consumer information provided |
| Chemical usage | No BPA, phthalates, or heavy metals | Test certification required |
| Production waste | <2% material waste target | Monthly reporting required |
| Carbon footprint | Offset program for manufacturing | Documented in annual report |

## PACKAGING & DELIVERY SPECIFICATIONS

### Shipping Configuration

| Aspect | Specification | Notes |
|:---|:---|:---|
| Bundle size | 50 tags per bundle | Secured with paper band |
| Master carton | 20 bundles (1,000 tags) | Recyclable cardboard only |
| Protection | Kraft paper separation layers | No plastic wrapping |
| Identification | Master carton labeled with batch | QR code for internal tracking |
| Sequencing | Tags in sequential serial number | Maintained in bundling |

### Quality Assurance Documentation

Required documentation with each shipment:
- Material source certification
- NFC functionality test results (100% testing)
- Batch manufacturing record
- Environmental compliance certificate
- Color standard matching report

## SEASONAL VARIATIONS

### Limited Edition Identifiers

| Season | Identifier | Visual Differentiation |
|:---|:---|:---|
| Spring '26 | Small green dot (PMS 7489C) | Upper right corner of primary tag |
| Summer '26 | Small blue dot (PMS 299C) | Upper right corner of primary tag |
| Fall '26 | Small amber dot (PMS 7550C) | Upper right corner of primary tag |
| Winter '26 | Small gray dot (PMS Cool Gray 6C) | Upper right corner of primary tag |
| Collaboration series | Diagonal corner clip (5mm) | Upper right corner physical alteration |

### Special Collection Adaptations

For special collections, the following adaptations are permitted:
- Color: Tag stock may shift to collection-specific palette
- Material: May upgrade to specialty papers (specification approval required)
- Size: May scale up to 25% larger for premium collections
- Finishing: May add single special process (foil, emboss, etc.)

All adaptations must maintain NFC functionality and core brand elements.

## AUTHENTICATION FLOW

### Customer Experience

1. Customer purchases GOOD ENOUGH™ product
2. Hangtag directs to scan with smartphone
3. NFC read directs to goodenough.us/verify
4. Authentication success displays:
   - Product details
   - Manufacturing origin
   - Sustainability metrics
   - Registration option
5. Optional product registration for warranty/community

### Authentication Failures

If tag is counterfeited or tampered with:
- Error page displays with explanation
- Report counterfeit option
- Nearest legitimate retailer locations
- Educational content on authentic products

## APPROVED DESIGN REFERENCES

| Reference | Location | Access Method |
|:---|:---|:---|
| Master artwork files | Design server | /GOOD_ENOUGH/Hangtags/Masters/ |
| Font package | Typography system | Franklin Gothic family (licensed) |
| Material samples | Physical library | Sample ID: TAG-MASTER-2025SS |
| NFC reference sample | QC lab | Authentication test unit #GE-NFC-STD |
| Color standards | Digital & physical | Pantone reference + digital profiles |

## IMPLEMENTATION TIMELINE

| Milestone | Date | Deliverable |
|:---|:---|:---|
| Design finalization | July 15, 2025 | Approved artwork files |
| Material sourcing | July 25, 2025 | Vendor commitments |
| NFC programming setup | August 10, 2025 | System integration test |
| First production sample | August 20, 2025 | Physical prototype review |
| Production approval | August 30, 2025 | Final specification sign-off |
| Full production | September 15, 2025 | Manufacturing commencement |
| First product application | October 2025 | Fall/Winter collection |

---

**GOOD ENOUGH™ Confidential Design Specification**  
© 2025 GOOD ENOUGH, Inc. All Rights Reserved.  
For manufacturing partners under NDA only. 