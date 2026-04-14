#!/usr/bin/env python3
"""
seed_lekki_final.py
───────────────────
Fixed version — resolves two issues:
1. source_type enum error → uses 'whatsapp' (existing valid value) 
   OR run the SQL fix first (recommended)
2. Reads directly from your Excel file so location is correct

Run:
  pip install supabase openpyxl pandas --break-system-packages
  export SUPABASE_SERVICE_ROLE_KEY=your_key
  python3 seed_lekki_final.py
"""

import os, sys, re
from datetime import datetime, timezone

# ─── SQL to run FIRST in Supabase SQL Editor ─────────────────────────────────
SUPABASE_SQL = """
-- STEP 1: Run this in Supabase SQL Editor BEFORE running this script
-- Dashboard → SQL Editor → New query → paste → Run

ALTER TYPE source_type_enum ADD VALUE IF NOT EXISTS 'research-verified';
ALTER TYPE source_type_enum ADD VALUE IF NOT EXISTS 'agency-partner';
ALTER TYPE source_type_enum ADD VALUE IF NOT EXISTS 'csv-import';

-- Then come back and run this Python script
"""

try:
    import pandas as pd
    import openpyxl
except ImportError:
    print("Run: pip install pandas openpyxl --break-system-packages")
    sys.exit(1)

try:
    from supabase import create_client
except ImportError:
    print("Run: pip install supabase --break-system-packages")
    sys.exit(1)

# ─── Connection ───────────────────────────────────────────────────────────────
URL = 'https://ftbmfjkrgcbykombxdlh.supabase.co'
KEY = os.environ.get('SUPABASE_SERVICE_ROLE_KEY', '')

if not KEY:
    print("ERROR: export SUPABASE_SERVICE_ROLE_KEY=your_key")
    sys.exit(1)

sb  = create_client(URL, KEY)
NOW = datetime.now(timezone.utc).isoformat()

# ─── Check what source_type enum values exist ─────────────────────────────────
print("Checking database enum values...")
try:
    # Try a test insert to see if enum values are there
    test = sb.table('properties').select('source_type').limit(1).execute()
    existing_types = set(r.get('source_type') for r in (test.data or []) if r.get('source_type'))
    print(f"Existing source_type values: {existing_types or 'none found'}")
except Exception as e:
    print(f"Warning: {e}")

# ─── Read your Excel file ──────────────────────────────────────────────────────
EXCEL_PATH = os.path.expanduser('~/zalone/lekki_property_data_template.xlsx')
if not os.path.exists(EXCEL_PATH):
    # Try current directory
    EXCEL_PATH = 'lekki_property_data_template.xlsx'

if not os.path.exists(EXCEL_PATH):
    print(f"Excel file not found. Put lekki_property_data_template.xlsx in ~/zalone/ and retry")
    sys.exit(1)

print(f"Reading {EXCEL_PATH}...")
df = pd.read_excel(EXCEL_PATH)
print(f"Columns: {list(df.columns)}")
print(f"Rows: {len(df)}")

# ─── Price parsing ────────────────────────────────────────────────────────────
def parse_price(raw):
    if raw is None or (isinstance(raw, float) and str(raw) == 'nan'): return None, 'NGN'
    s = str(raw).strip().lower().replace(',','').replace(' ','')
    currency = 'USD' if any(x in s for x in ['$','usd']) else 'NGN'
    # Remove currency symbols
    s = re.sub(r'[^0-9.]', '', s)
    try:
        num = float(s)
        if currency == 'NGN' and 0 < num < 10_000:
            num *= 1_000_000  # "120" → ₦120M
        return num if num > 0 else None, currency
    except:
        return None, 'NGN'

# ─── Build records from Excel ─────────────────────────────────────────────────
records  = []
skipped  = []

NEIGHBORHOOD_FIXES = {
    'lekki phase 1': 'Lekki Phase 1',
    'lekki phase one': 'Lekki Phase 1',
    'lekki ph 1': 'Lekki Phase 1',
    'lekki ph1': 'Lekki Phase 1',
    'lekki phase1': 'Lekki Phase 1',
    'lekki': 'Lekki',
    'ikoyi': 'Ikoyi',
    'victoria island': 'Victoria Island',
    'vi': 'Victoria Island',
    'ikota': 'Ikota',
    'chevron': 'Chevron',
    'ajah': 'Ajah',
}

PROP_TYPE_MAP = {
    'detached duplex': 'detached-duplex',
    'semi detached': 'semi-detached-duplex',
    'terraced duplex': 'terraced-duplex',
    'duplex': 'duplex',
    'apartment': 'apartment',
    'flat': 'apartment',
    'bungalow': 'bungalow',
    'maisonette': 'maisonette',
    'penthouse': 'penthouse',
    'land': 'land',
}

def norm_type(raw):
    if not raw or str(raw) == 'nan': return None
    s = str(raw).lower().strip()
    for k, v in PROP_TYPE_MAP.items():
        if k in s: return v
    return s

def norm_neighborhood(raw):
    if not raw or str(raw) == 'nan': return None, 'unknown'
    s = str(raw).lower().strip()
    if s in NEIGHBORHOOD_FIXES:
        return NEIGHBORHOOD_FIXES[s], 'exact'
    for k, v in NEIGHBORHOOD_FIXES.items():
        if k in s:
            return v, 'fuzzy'
    return str(raw).strip(), 'unknown'

# Try to determine source_type — use 'whatsapp' as fallback if enum not extended
SOURCE_TYPE_DEFAULT = 'whatsapp'  # Safe fallback — already in enum

for i, row in df.iterrows():
    # Get price
    # Your file has 'Price (NGN)' column
    price_col = next((c for c in df.columns if 'price' in c.lower() and 'bedroom' not in c.lower()), None)
    price_raw = row.get(price_col) if price_col else None
    price, currency = parse_price(price_raw)

    if not price:
        skipped.append({'row': i+2, 'reason': f'No valid price in "{price_col}"'})
        continue

    # Get neighborhood from 'Area' column (your actual column name)
    area_col = next((c for c in df.columns if c.strip().lower() in ('area', 'neighborhood', 'neighbourhood', 'location')), None)
    area_raw = row.get(area_col, '') if area_col else ''
    neighborhood, confidence = norm_neighborhood(area_raw)

    # Sub-location
    sub_loc = row.get('Sub Location', '') or ''
    if str(sub_loc) == 'nan': sub_loc = ''

    # If neighborhood is unknown but default is Lekki Phase 1 (all your current data)
    if confidence == 'unknown' and neighborhood:
        # Check if it's actually lekki phase 1 data based on price range
        if 100_000_000 < price < 2_000_000_000:
            neighborhood = 'Lekki Phase 1'
            confidence = 'inferred'

    # Other fields
    beds_raw = row.get('Bedrooms')
    beds = int(float(str(beds_raw))) if beds_raw and str(beds_raw) != 'nan' else None

    ptype = norm_type(row.get('Property Type'))

    # Platform / Agency
    platform = str(row.get('Platform Source', '') or '').strip()
    if platform == 'nan': platform = ''
    if 'vela' in platform.lower(): platform = 'Vala Homes'  # fix typo

    agent = str(row.get('Agent Name', '') or '').strip()
    if agent == 'nan': agent = ''

    listing_id = str(row.get('Listing ID', '') or '').strip()
    if listing_id == 'nan': listing_id = ''

    url = str(row.get('Listing URL', '') or '').strip()
    if url == 'nan': url = ''

    land_size = str(row.get('Land Size', '') or '').strip()
    if land_size == 'nan': land_size = ''

    notes = str(row.get('Notes', '') or '').strip()
    if notes == 'nan': notes = ''

    date_listed = str(row.get('Date Listed', '') or '').strip()
    if date_listed == 'nan': date_listed = ''

    is_dup = str(row.get('Possible Duplicate? (Yes/No)', '') or '').strip().lower() == 'yes'

    record = {
        'property_type':       ptype,
        'bedrooms':            beds,
        'city':                'Lagos',
        'neighborhood':        neighborhood,
        'country_code':        'NG',
        'price_local':         price,
        'currency_code':       currency,
        'listing_type':        'for-sale',
        'source_type':         SOURCE_TYPE_DEFAULT,  # 'whatsapp' — safe fallback
        'confidence':          0.90 if confidence == 'exact' else 0.80 if confidence in ('fuzzy','inferred') else 0.65,
        'raw_data': {
            'listing_id':    listing_id or None,
            'platform':      platform or 'Research',
            'agent_name':    agent or None,
            'source_url':    url or None,
            'land_size':     land_size or None,
            'notes':         notes or None,
            'date_listed':   date_listed or None,
            'is_duplicate':  is_dup,
            'location_confidence': confidence,
            'sub_location':  sub_loc or None,
            'imported_from': 'lekki_property_data_template.xlsx',
            'imported_at':   NOW,
        }
    }
    records.append(record)

# ─── Deduplicate before inserting ────────────────────────────────────────────
seen = {}
unique_records = []
dup_count = 0

for r in records:
    key = f"{r['neighborhood']}|{r['bedrooms']}|{round((r['price_local'] or 0) / 5_000_000) * 5_000_000}"
    if key not in seen:
        seen[key] = True
        unique_records.append(r)
    else:
        dup_count += 1

print(f"\n{'='*55}")
print(f"Total rows read:      {len(df)}")
print(f"Valid records:        {len(records)}")
print(f"After dedup:          {len(unique_records)}")
print(f"Duplicates removed:   {dup_count}")
print(f"Skipped (no price):   {len(skipped)}")
print(f"{'='*55}")
print(f"\nNeighborhood distribution:")
from collections import Counter
hood_counts = Counter(r['neighborhood'] for r in unique_records)
for hood, count in hood_counts.most_common():
    print(f"  {hood}: {count}")

print(f"\nSeeding {len(unique_records)} records...")
print("─" * 55)

success, failed = 0, []

for r in unique_records:
    try:
        result = sb.table('properties').insert(r).execute()
        if result.data:
            beds = r['bedrooms']
            price = r['price_local']
            curr  = r['currency_code']
            plat  = r['raw_data']['platform']
            hood  = r['neighborhood']
            sym   = '$' if curr == 'USD' else '₦'
            print(f"  ✓ {beds or '?'}bed {(r['property_type'] or 'property'):<20} {sym}{price/1_000_000:.0f}M  [{plat[:15]:<15}] {hood}")
            success += 1
        else:
            failed.append(r)
            print(f"  ✗ No data returned for {r['bedrooms']}bed ₦{r['price_local']/1_000_000:.0f}M")
    except Exception as e:
        err = str(e)
        # If enum error, show the SQL to fix it
        if 'enum' in err.lower():
            print(f"\n  ✗ ENUM ERROR — Run this SQL in Supabase first:")
            print(f"    ALTER TYPE source_type_enum ADD VALUE IF NOT EXISTS 'research-verified';")
            print(f"    Then change SOURCE_TYPE_DEFAULT to 'research-verified' and retry")
            print()
        else:
            print(f"  ✗ {r['bedrooms']}bed ₦{r['price_local']/1_000_000:.0f}M — {err[:100]}")
        failed.append(r)

print("─" * 55)
print(f"\n✓ Inserted: {success}")
print(f"✗ Failed:   {len(failed)}")

if skipped:
    print(f"\nSkipped rows (no price):")
    for s in skipped:
        print(f"  Row {s['row']}: {s['reason']}")

if success > 0:
    print(f"\n🎉 Done! Visit: http://localhost:3000/neighborhood/lekki-phase-1")
    print(f"   Properties from your Excel file are now in Manop's database")
elif failed and any('enum' in str(e).lower() for e in [str(f) for f in failed]):
    print(f"\n⚠️  Enum error blocking all inserts.")
    print(f"   Run this SQL in Supabase Dashboard → SQL Editor:")
    print(f"   {SUPABASE_SQL}")