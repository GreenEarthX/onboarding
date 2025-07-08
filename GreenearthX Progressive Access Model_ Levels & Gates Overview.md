# **GreenearthX Progressive Access Model: Levels & Gates Overview**

GreenearthX controls user access through **4 levels (L0–L3)**, each gated by automated/manual **verification checks (G0–G3)**. Users unlock features step-by-step as their trust and data completeness increase.

---

## **Level 0 → Gate G0**

**“Are you human & reachable?”**

* **Data collected:** Work email, preferred name, reCAPTCHA v3, domain checks (MX, SPF), disposable email check

* **Automated checks:** CAPTCHA \+ domain risk score (5s max)

* **Threshold:**  
    • Score ≥ 0.7 → provisional account \+ 2FA  
    • Score \< 0.7 → flagged for hold/bot suspect

* **Access:**  
    • Account shell only — no dashboard, no tools, no form

---

## **Level 1 → Gate G1**

**“Light KYC – who do you work for?”**

* **Data collected:** Legal name, job title, company name & website, LinkedIn URL, onboarding form (project metadata)

* **Automated checks (≤15s):**  
    • Email domain vs company domain (fuzzy match)  
    • LinkedIn org verification  
    • Entity resolution (OSINT, registries)  
    • Sanctions burst check  
    • Confidence threshold ≥ 80% (fallback: PDF upload \+ OCR)

* **Unlocked features:**  
    • Certification & Prediction tools  
    • Partial frontend (GeoMap, asset inventory builder)  
    • Onboarding form access  
    • Searchable ecosystem profile (opt-in)

---

## **Level 2 → Gate G2**

**“Ready for the marketplace?”**

* **Data collected:** Company legal profile (address, VAT), ESG documents, proof of authority, initial asset listings (metadata)

* **Automated checks (≤60s):**  
    • AI Marketplace dossier (solvency, ESG fetch, peer reputation)  
    • AML/PEP burst check  
    • Duplicate asset detection (GeoJSON clustering, perceptual hashes)

* **Unlocked features:**  
    • Full Trade App UI  
    • Marketplace listings & filtering  
    • Internal counterparty chat  
    • Offtake contract negotiation & closure  
    • Public company card (searchable)

---

## **Level 3 → Gate G3**

**“Trusted Partner / Power Seller”**

* **Data collected:** Third-party asset audit, transaction history, signed partner agreement, SLA proof

* **Manual checks (3 business days):**  
    • Smart-contract audit trail (tokenized assets)  
    • File hash vs auditor PKI key  
    • Historical breach analysis

* **Unlocked features:**  
    • Higher daily trading limits  
    • Priority listing placement  
    • API & webhook access  
    • Trusted badge in search filters

---

# **Data Visibility & Privacy**

| Level | Data Visibility |
| ----- | ----- |
| L0→L1 | Private only (not shown) |
| L2 | Company metadata searchable\* |
| L3 | Badges & trust indicators |

\*All sensitive docs remain encrypted and visible only to GreenearthX staff.

---

# **User Experience Touchpoints**

* Emails at every gate result explaining next steps

* Dashboard banners with progress hints (e.g., “Upload ESG doc for L2”)

* Support chat linked to verification status

* Downloadable audit log for compliance

---

# **Timing & Architecture**

| Gate | Auto Decision | Manual SLA |
| ----- | ----- | ----- |
| G0 | \<5 sec | — |
| G1 | \<15 sec | 4 hrs (business) |
| G2 | \<60 sec | 1 business day |
| G3 | — | 3 business days |

*   
  Each gate runs as an isolated microservice

* All events logged in a JSON-based Verification Dossier for scoring & reviews

---

# **Summary Table**

| Level | Gate | Tools Access | GEX Access | Can Submit Data | Trade App | Close Deals | API Access | Badge |
| ----- | ----- | ----- | ----- | ----- | ----- | ----- | ----- | ----- |
| L0 | G0 | ❌ No | ❌ No | ❌ No | ❌ No | ❌ No | ❌ No | ❌ No |
| L1 | G1 | ✅ Cert, Prediction, GeoMap | Partial | ✅ Yes | ❌ No | ❌ No | ❌ No | ❌ No |
| L2 | G2 | ✅ All | Full | ✅ Yes | ✅ Yes | ✅ Yes | ❌ No | ❌ No |
| L3 | G3 | ✅ All | Full | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes |  |

