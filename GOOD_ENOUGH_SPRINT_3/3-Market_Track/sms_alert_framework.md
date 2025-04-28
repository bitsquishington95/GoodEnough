# SMS ALERT FRAMEWORK
**GOOD ENOUGH™ Market Program | Customer Engagement System**
*Version 1.0 | August 2025*

## OVERVIEW

The GOOD ENOUGH™ SMS Alert System serves as a critical component of our weekly market ritual, driving urgency, exclusivity, and attendance at our farmers market drops. This framework outlines the technical implementation, messaging strategy, and operational guidelines for creating a high-converting SMS marketing program that maintains our brand's understated luxury positioning.

## 1. SYSTEM ARCHITECTURE

### Technical Requirements

| Component | Specification | Purpose |
|:---|:---|:---|
| SMS Platform | Twilio API | Message delivery and response handling |
| Database | MongoDB | Customer profiles and engagement metrics |
| Geolocation | Google Maps API | Location-based messaging |
| Integration | Shopify + Custom NFC System | Customer data synchronization |
| Compliance | TCPA & GDPR compliant | Legal protection |

### Data Structure

**Customer Profile Schema:**
```json
{
  "phone": "+13125551234",
  "firstName": "Jordan", 
  "markets": ["chicago", "denver"],
  "optInDate": "2025-08-15T14:23:11Z",
  "preferences": {
    "productTypes": ["tee", "crew", "jacket"],
    "notificationTypes": ["drops", "restocks", "events"],
    "frequency": "weekly"
  },
  "engagement": {
    "lastMessageSent": "2025-08-15T18:00:00Z",
    "messagesSent": 8,
    "messagesOpened": 7,
    "responseRate": 0.25,
    "conversions": 3
  },
  "purchaseHistory": [
    {
      "date": "2025-08-02T10:15:22Z",
      "product": "Heavy Tee",
      "market": "chicago",
      "edition": "047/200"
    }
  ]
}
```

### System Workflow

1. **Opt-In Collection:**
   - In-market QR code scan
   - NFC tap registration option
   - Website sign-up with market selection
   - Post-purchase automated invitation

2. **List Segmentation:**
   - Primary market location
   - Purchase history
   - Engagement level (high/medium/low)
   - Product preferences
   - Distance from market

3. **Message Delivery:**
   - Automated scheduling based on market calendar
   - Manual override capability for special announcements
   - Delivery time optimization by market

4. **Response Handling:**
   - Automated replies to common keywords
   - Integration with customer service platform
   - Response analysis for engagement metrics

## 2. MESSAGING STRATEGY

### Tone & Voice Guidelines

| Element | Specification | Example |
|:---|:---|:---|
| Brevity | Maximum 160 characters | "Tomorrow. 9-ish. Limited to 200." |
| Formality | Minimal punctuation, lowercase | "good enough / chicago" vs. "GOOD ENOUGH™ CHICAGO!" |
| Personality | Deadpan, matter-of-fact | "it might sell out. or not." vs. "DON'T MISS OUT!" |
| Spacing | Generous white space | Single sentences with line breaks |
| Consistency | Same format each week | Day, time, product, quantity, location |

### Message Types & Templates

**1. Friday Drop Announcement**
```
good enough / [city]

tomorrow. 9-ish.
[product] in [color].
limited to [number] pieces.

early access line forms at 8:45.
this text is your pass.

reply SKIP to pause notifications.
```

**2. Saturday Morning Reminder**
```
good enough / [city]

dropping in 1 hour.
show this text for early line access.
[market address]

[number] pieces remain.
```

**3. Sell-Out Notification**
```
good enough / [city]

today's drop sold out.
next saturday: [product] in [color].

verified resale now available:
goodenough.com/[city]/preloved
```

**4. Special Collaboration Alert**
```
good enough / [city] × [partner]

limited collaboration.
this saturday only.
[product] + [special element]

early access requires both texts.
```

**5. Restock Notification** (Rare)
```
good enough / [city]

restock.
[product] in [color].
[number] pieces.
tomorrow. 11-ish.

reply YES to reserve one.
```

### Keyword Response System

| Keyword | Automated Response | Action |
|:---|:---|:---|
| SKIP | "no drop notification this week. see you next saturday." | Pause 7 days |
| STOP | "you're unsubscribed from good enough alerts. text START to rejoin." | Full opt-out |
| START | "you're back on the good enough / [city] list." | Re-activate |
| YES | "noted. arrive before 9:15 and mention your phone number." | Flag for staff |
| INFO | "[current product] details: [price], [material], made in [country]. [special feature]." | Product info |
| WHERE | "[market name]. [address]. [hours]." | Location info |

## 3. OPERATIONAL GUIDELINES

### Weekly Messaging Schedule

| Day | Time | Message Type | Purpose |
|:---|:---|:---|:---|
| Tuesday | 2pm | Drop Preview | Early product hint to encourage week planning |
| Friday | 7pm | Primary Announcement | Main drop notification with details |
| Saturday | 8am | Final Reminder | Last call for attendance |
| Saturday | 12pm | Sell-Out Notification | Create FOMO and build anticipation for next week |
| Sunday | 4pm | Satisfaction Follow-up | For purchasers only: "how's your new [product]?" |

### List Building Strategies

1. **In-Market Acquisition:**
   - Sign-up QR code prominently displayed on booth
   - Staff trained to mention SMS list during authentication demos
   - Paper sign-up with digital transfer (backup method)
   - Instant confirmation message with offer: "show this text next week for early access"

2. **Digital Acquisition:**
   - Website opt-in with market selection
   - Social media profile links
   - NFC post-authentication opt-in prompt
   - Verified resale platform registration

3. **Incentive Structure:**
   - Early access to drops (15 minutes)
   - Occasional "text-only" special colorways
   - First notification of collaborations
   - Reserved quantities for SMS subscribers

### Franchise Implementation

| Responsibility | Market Lead | Headquarters |
|:---|:---|:---|
| List Building | ✓ | |
| Custom Message Approval | ✓ | ✓ |
| Regular Schedule Execution | | ✓ |
| Response Monitoring | ✓ | |
| Performance Tracking | ✓ | ✓ |
| Compliance Management | | ✓ |

### Staff Training Points

1. **List Sign-Up Process:**
   - Clear explanation of benefits: "15 minutes early access every Saturday"
   - Privacy assurance: "Just market notifications, max 3 per week"
   - Demonstrating exclusivity: "Our Saturday text is the only way to guarantee access to limited drops"

2. **SMS Verification at Market:**
   - Quick visual verification of SMS message
   - Process for adding to early access line
   - Handling customers without SMS (regular line)

3. **Managing SMS Inquiries:**
   - Standard responses to common questions
   - Escalation path for technical issues
   - Recording feedback about SMS program

## 4. PERFORMANCE METRICS

### Key Performance Indicators

| Metric | Target | Calculation Method |
|:---|:---|:---|
| Opt-In Rate | 40% of customers | SMS subscribers / Total customers |
| Weekly Growth | 5% list growth | (New subscribers - Unsubscribes) / List size |
| Open Rate | 95%+ | Messages delivered / Messages opened |
| Conversion Rate | 25% | Subscribers who purchase / Subscribers who receive message |
| Retention Rate | 85%+ | (1 - Unsubscribes) / List size |
| Early Access Line | 50+ people | Customers showing SMS for early access |

### Measurement Tools

1. **SMS Platform Analytics:**
   - Delivery rates
   - Response rates
   - Keyword usage
   - Time patterns

2. **Market Day Tracking:**
   - SMS verification counts
   - Early access line length
   - Conversion to purchase
   - Staff observation notes

3. **Customer Feedback Collection:**
   - Direct responses to SMS
   - In-market verbal feedback
   - Post-purchase surveys
   - Digital engagement correlation

### Optimization Process

1. **Weekly Analysis:**
   - Review of message performance
   - Comparison across markets
   - A/B test results
   - Conversion correlation

2. **Monthly Refinement:**
   - Message template adjustments
   - Timing optimization
   - Frequency calibration
   - Segmentation improvement

3. **Quarterly Strategy Review:**
   - ROI calculation
   - Platform evaluation
   - Compliance audit
   - Feature enhancement planning

## 5. PRIVACY & COMPLIANCE

### Legal Requirements

1. **Explicit Consent:**
   - Clear opt-in language: "By entering your number, you agree to receive GOOD ENOUGH market alerts. Max 3 msgs/week. Msg & data rates may apply."
   - Double opt-in verification
   - Documented consent timestamp
   - Easy opt-out instructions in every message

2. **Privacy Protection:**
   - Secure data storage
   - No sharing with third parties
   - Limited data retention
   - Regular security audits

3. **Regulatory Compliance:**
   - TCPA adherence
   - GDPR compatibility
   - CCPA compatibility
   - State-specific regulations

### Documentation Requirements

| Document | Update Frequency | Responsibility |
|:---|:---|:---|
| Privacy Policy | Quarterly | Legal Team |
| Terms of Service | Quarterly | Legal Team |
| Opt-In Records | Real-time | SMS Platform |
| Compliance Training | Bi-annually | Market Program Director |

## 6. IMPLEMENTATION CHECKLIST

### Platform Setup (One-Time)

- [ ] SMS provider account creation and API integration
- [ ] Custom shortcode or number acquisition
- [ ] Database schema implementation
- [ ] Template creation and testing
- [ ] Compliance documentation review
- [ ] Staff training materials development
- [ ] Integration with NFC and e-commerce systems

### New Market Launch (Per Market)

- [ ] Local number acquisition (if required)
- [ ] Market-specific template customization
- [ ] Initial keyword testing
- [ ] Booth signage with SMS promotion
- [ ] Staff training on SMS verification
- [ ] First-week messaging schedule
- [ ] Baseline metrics establishment

### Weekly Operations

- [ ] Message schedule confirmation
- [ ] Product and inventory details verification
- [ ] Custom message approval (if applicable)
- [ ] Delivery confirmation monitoring
- [ ] Response handling
- [ ] Performance metrics collection
- [ ] List hygiene maintenance

## 7. TROUBLESHOOTING GUIDE

### Common Issues & Solutions

| Issue | Potential Cause | Solution |
|:---|:---|:---|
| Low delivery rate | Carrier filtering | Adjust message content, contact SMS provider |
| High opt-out rate | Message frequency too high | Reduce frequency, improve value proposition |
| Poor conversion | Timing or content issues | Test different send times, refine messaging |
| Technical failures | API or integration errors | Implement backup notification system |
| List growth stagnation | Insufficient acquisition efforts | Enhance in-market promotion, add incentives |

### Emergency Backup Plan

1. **SMS System Failure:**
   - Email backup to SMS subscribers
   - Social media announcements
   - In-market signage for regular customers
   - Staff protocol for honoring early access without SMS verification

2. **Low Engagement Recovery:**
   - Re-permission campaign
   - Enhanced value offering
   - Segment testing for improved relevance
   - Special "win-back" offers for inactive subscribers

## 8. SAMPLE IMPLEMENTATION TIMELINE

| Week | Activities | Ownership |
|:---|:---|:---|
| 1-2 | Platform selection, contract negotiation | Operations + Legal |
| 3-4 | System integration, template development | Tech + Marketing |
| 5 | Staff training materials creation | Training Team |
| 6 | Chicago market pilot launch | Chicago Market Lead |
| 7-8 | Performance assessment, optimization | Analytics Team |
| 9 | Training rollout to other markets | Market Program Director |
| 10+ | Ongoing optimization cycle | All Teams |

---

**Prepared by:** Digital Marketing Team  
**Approved by:** Market Program Director  
**Date:** August 15, 2025  
**Version:** 1.0  
**Confidentiality:** Internal Use Only 