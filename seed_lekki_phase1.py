#!/usr/bin/env python3
"""
seed_lekki_phase1.py
────────────────────
Seeds verified Lekki Phase 1 property data into Supabase.
Run from anywhere:
  SUPABASE_URL=xxx SUPABASE_KEY=yyy python3 seed_lekki_phase1.py

Source: Manual research — Property Pro + Vala Homes (April 2026)
Records: 25 verified listings, 1 anomaly removed (₦1M price error)
"""

import os, json
from datetime import datetime

try:
    from supabase import create_client
except ImportError:
    print("Install: pip install supabase")
    exit(1)

SUPABASE_URL = os.environ.get('SUPABASE_URL', 'https://ftbmfjkrgcbykombxdlh.supabase.co')
SUPABASE_KEY = os.environ.get('SUPABASE_KEY') or os.environ.get('SUPABASE_SERVICE_KEY')

if not SUPABASE_KEY:
    print("Set SUPABASE_KEY environment variable")
    exit(1)

sb = create_client(SUPABASE_URL, SUPABASE_KEY)

# ─── Verified Records ─────────────────────────────────────────────────────
# Source: lekki_property_data_template.xlsx — April 2026
# Platforms: Property Pro (5), Vala Homes (20)
# Anomaly excluded: Row 8 (₦1,000,000 — data entry error)

RECORDS = [
    # Property Pro listings
    {'property_type':'duplex',     'bedrooms':5,'price_local':870_000_000,'raw_data':{'listing_id':'1PHAG','platform':'Property Pro','agent_name':'Tugaris Realtor','notes':'Fully serviced luxury duplex, CCTV, fitted kitchen, gated estate','date_listed':'2026-04-08'}},
    {'property_type':'apartment',  'bedrooms':2,'price_local':290_000_000,'raw_data':{'listing_id':'4PFMH','platform':'Property Pro','source_url':'https://propertypro.ng/property/2-bedroom-flat-apartment-for-sale-freedom-way-lekki-phase-1-lekki-lagos-4PFMH','agent_name':'Own Your Size Nigeria Limited','sub_location':'Freedom Way','notes':'Fully serviced luxury apartment, CCTV, fitted kitchen, gated estate','date_listed':'2026-03-28'}},
    {'property_type':'duplex',     'bedrooms':4,'price_local':1_000_000_000,'raw_data':{'listing_id':'2PFMR','platform':'Property Pro','source_url':'https://propertypro.ng/property/4-bedroom-house-for-sale-gabby-adeosun-street-lekki-phase-1-lekki-lagos-2PFMR','agent_name':'Own Your Size Nigeria Limited','sub_location':'Gabby Adeosun Street','notes':'4BR Duplex in Lekki 1. All rooms en-suite, with servant\'s room en-suite and gate house en-suite. 350sqm','date_listed':'2026-03-31'}},
    {'property_type':'apartment',  'bedrooms':2,'price_local':190_000_000,'raw_data':{'listing_id':'1PGKA','platform':'Property Pro','agent_name':'Own Your Size Nigeria Limited','notes':'Newly Built 2 Bedroom Apartment'}},
    {'property_type':'apartment',  'bedrooms':2,'price_local':220_000_000,'raw_data':{'listing_id':'2NKBE','platform':'Property Pro','agent_name':'Tugaris Realtor','notes':'2 Bedroom Apartment'}},
    # Vala Homes listings
    {'property_type':'duplex',     'bedrooms':3,'price_local':600_000_000,'raw_data':{'platform':'Vala Homes','agent_name':'Precious Nzeh','notes':'Three bedroom terrace duplex'}},
    {'property_type':'duplex',     'bedrooms':4,'price_local':650_000_000,'raw_data':{'platform':'Vala Homes','agent_name':'Precious Nzeh','notes':'Four bedroom terrace duplex'}},
    {'property_type':'apartment',  'bedrooms':2,'price_local':220_000_000,'raw_data':{'platform':'Vala Homes','agent_name':'Precious Nzeh','notes':'Two bedroom apartment with BQ'}},
    {'property_type':'apartment',  'bedrooms':1,'price_local':150_000_000,'raw_data':{'platform':'Vala Homes','agent_name':'Precious Nzeh','notes':'One bedroom apartment with BQ'}},
    {'property_type':'maisonette', 'bedrooms':4,'price_local':800_000_000,'raw_data':{'platform':'Vala Homes','agent_name':'Precious Nzeh','notes':'Luxury four bedroom maisonette'}},
    {'property_type':'apartment',  'bedrooms':3,'price_local':400_000_000,'raw_data':{'listing_id':'unref','platform':'Vala Homes','agent_name':'Precious Nzeh'}},
    {'property_type':'apartment',  'bedrooms':2,'price_local':350_000_000,'raw_data':{'listing_id':'730lekkip1','platform':'Vala Homes','agent_name':'Precious Nzeh'}},
    {'property_type':'apartment',  'bedrooms':2,'price_local':270_000_000,'raw_data':{'listing_id':'729lekkip1','platform':'Vala Homes','agent_name':'Precious Nzeh'}},
    {'property_type':'apartment',  'bedrooms':3,'price_local':320_000_000,'raw_data':{'listing_id':'706lekkip1','platform':'Vala Homes','agent_name':'Precious Nzeh'}},
    {'property_type':'apartment',  'bedrooms':2,'price_local':294_000_000,'raw_data':{'listing_id':'705lekkip1','platform':'Vala Homes','agent_name':'Precious Nzeh'}},
    {'property_type':'apartment',  'bedrooms':3,'price_local':494_000_000,'raw_data':{'listing_id':'606lekkip1','platform':'Vala Homes','agent_name':'Precious Nzeh'}},
    {'property_type':'apartment',  'bedrooms':1,'price_local':199_000_000,'raw_data':{'listing_id':'604lekkip1','platform':'Vala Homes','agent_name':'Precious Nzeh'}},
    {'property_type':'apartment',  'bedrooms':2,'price_local':299_000_000,'raw_data':{'listing_id':'591lekkip1','platform':'Vala Homes','agent_name':'Precious Nzeh'}},
    {'property_type':'apartment',  'bedrooms':3,'price_local':399_000_000,'raw_data':{'listing_id':'590lekkip1','platform':'Vala Homes','agent_name':'Precious Nzeh'}},
    {'property_type':'apartment',  'bedrooms':4,'price_local':385_000_000,'raw_data':{'listing_id':'579lekkip1','platform':'Vala Homes','agent_name':'Precious Nzeh'}},
    {'property_type':'apartment',  'bedrooms':2,'price_local':230_000_000,'raw_data':{'listing_id':'555lekkip1','platform':'Vala Homes','agent_name':'Precious Nzeh'}},
    {'property_type':'apartment',  'bedrooms':2,'price_local':170_000_000,'raw_data':{'listing_id':'495lekkip1','platform':'Vala Homes','agent_name':'Precious Nzeh'}},
    {'property_type':'apartment',  'bedrooms':3,'price_local':225_000_000,'raw_data':{'listing_id':'488lekkip1','platform':'Vala Homes','agent_name':'Precious Nzeh'}},
    {'property_type':'apartment',  'bedrooms':2,'price_local':240_000_000,'raw_data':{'listing_id':'487lekkip1','platform':'Vala Homes','agent_name':'Precious Nzeh'}},
    {'property_type':'duplex',     'bedrooms':5,'price_local':970_000_000,'raw_data':{'listing_id':'429lekkip1','platform':'Vala Homes','agent_name':'Fortune Abraham','notes':'Newly built five bedroom detached duplex'}},
]

# Add common fields
for r in RECORDS:
    r.update({
        'city':          'Lagos',
        'neighborhood':  'Lekki Phase 1',
        'country_code':  'NG',
        'currency_code': 'NGN',
        'listing_type':  'for-sale',
        'source_type':   'research-verified',
        'confidence':    0.88,
    })
    r['raw_data']['imported_from'] = 'lekki_property_data_template.xlsx'
    r['raw_data']['imported_at']   = datetime.now().isoformat()

print(f"Seeding {len(RECORDS)} Lekki Phase 1 records into Supabase...")
print(f"Source: Property Pro ({sum(1 for r in RECORDS if r['raw_data']['platform']=='Property Pro')}) + Vala Homes ({sum(1 for r in RECORDS if r['raw_data']['platform']=='Vala Homes')})")
print()

success = 0
failed  = 0

for r in RECORDS:
    try:
        result = sb.table('properties').insert(r).execute()
        if result.data:
            beds = r['bedrooms']
            price = r['price_local']
            plat  = r['raw_data']['platform']
            print(f"  ✓ {beds}bed {r['property_type']} | ₦{price/1_000_000:.0f}M | {plat}")
            success += 1
        else:
            print(f"  ✗ Failed: {r}")
            failed += 1
    except Exception as e:
        print(f"  ✗ Error: {e} — {r['bedrooms']}bed ₦{r['price_local']/1_000_000:.0f}M")
        failed += 1

print(f"\n{'='*50}")
print(f"Done: {success} inserted, {failed} failed")
print(f"\nLekki Phase 1 is now seeded.")
print(f"Visit: localhost:3000/neighborhood/lekki-phase-1")
