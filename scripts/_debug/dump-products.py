"""Read all products + product_images + storage files from local Supabase."""
import json
import os
import urllib.request

env = {}
with open('.env.local') as f:
    for line in f:
        line = line.strip()
        if line and not line.startswith('#') and '=' in line:
            k, v = line.split('=', 1)
            env[k] = v

url = env['NEXT_PUBLIC_SUPABASE_URL'].rstrip('/')
key = env['SUPABASE_SERVICE_ROLE_KEY']

def get(path, accept='application/json'):
    req = urllib.request.Request(
        url + path,
        headers={'apikey': key, 'Authorization': 'Bearer ' + key, 'Accept': accept},
    )
    with urllib.request.urlopen(req) as r:
        return r.read()

print('=' * 60)
print('PRODUCTS')
print('=' * 60)
products = json.loads(get('/rest/v1/products?select=id,title,slug,status,price,created_at&order=created_at.desc'))
print(f'Total: {len(products)}')
for p in products:
    print(f"  {p['status']:8s} PHP{float(p['price']):>9.2f}  {p['title']:<35s}  {p['slug']}")
    print(f"    id={p['id']}  created={p['created_at']}")

print()
print('=' * 60)
print('PRODUCT IMAGES')
print('=' * 60)
images = json.loads(get('/rest/v1/product_images?select=id,product_id,storage_path,is_primary,alt_text,sort_order&order=sort_order&limit=100'))
print(f'Total: {len(images)}')
for img in images:
    pmark = ' [PRIMARY]' if img.get('is_primary') else ''
    print(f"  {img['storage_path']:<55s}{pmark}  sort={img.get('sort_order',0)}")
    print(f"    id={img['id']}  alt={img.get('alt_text')!r}")

print()
print('=' * 60)
print('STORAGE OBJECTS in products bucket')
print('=' * 60)
# POST with JSON body
body = json.dumps({'limit': 200, 'prefix': '', 'sortBy': {'column': 'name', 'order': 'asc'}}).encode()
req = urllib.request.Request(
    url + '/storage/v1/object/list/products',
    data=body,
    headers={'apikey': key, 'Authorization': 'Bearer ' + key, 'Content-Type': 'application/json'},
    method='POST',
)
try:
    with urllib.request.urlopen(req) as r:
        objs = json.loads(r.read())
    print(f'Total objects: {len(objs)}')
    for o in objs[:50]:
        size = o.get('metadata', {}).get('size', '?')
        print(f"  {o.get('name', '?'):<60s}  size={size}")
except Exception as e:
    print(f'Error: {e}')

print()
print('=' * 60)
print('CATEGORIES')
print('=' * 60)
cats = json.loads(get('/rest/v1/categories?select=id,name,slug,status&order=name'))
print(f'Total: {len(cats)}')
for c in cats:
    print(f"  {c['status']:10s} {c['name']:<25s}  {c['slug']}")