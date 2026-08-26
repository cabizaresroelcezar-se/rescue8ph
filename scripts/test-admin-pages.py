"""Sign in via the dev server and hit /admin/pages/<uuid> to see the actual response."""
import json
import urllib.request
import urllib.error
import http.cookiejar

env = {}
with open('.env.local') as f:
    for line in f:
        line = line.strip()
        if line and not line.startswith('#') and '=' in line:
            k, v = line.split('=', 1)
            env[k] = v

base = 'http://localhost:3000'
url = env['NEXT_PUBLIC_SUPABASE_URL'].rstrip('/')
key = env['SUPABASE_SERVICE_ROLE_KEY']

# 1) Get a user with admin role
req = urllib.request.Request(
    url + '/rest/v1/profiles?select=id,email,role:roles(name)&roles.name=in.(admin,super_admin)&limit=1',
    headers={'apikey': key, 'Authorization': 'Bearer ' + key},
)
admins = json.loads(urllib.request.urlopen(req).read())
if not admins:
    print('No admin user found')
    exit()
admin = admins[0]
print(f'Admin: {admin.get("email")} ({admin["id"][:8]}...)')

# 2) Sign in via Supabase REST to get access token
# Note: we can't easily authenticate as this user without their password,
# but we can use the service-role key to GET a session - actually no, that
# doesn't work either. Let's just check what the page returns without auth.
print()
print('Without auth:')
for path in ['/admin/pages', '/admin/pages/baf1e7b3-f80e-44d0-b8df-bd5989d7cb96', '/admin/pages/home']:
    try:
        req = urllib.request.Request(base + path, headers={'User-Agent': 'curl/8.0'})
        # Don't follow redirects
        class NoRedirect(urllib.request.HTTPRedirectHandler):
            def redirect_request(self, *a, **kw): return None
        opener = urllib.request.build_opener(NoRedirect)
        r = opener.open(req)
        body = r.read()[:200]
        print(f'  {path:60s} {r.status}  body[:200]={body!r}')
    except urllib.error.HTTPError as e:
        body = e.read()[:200]
        print(f'  {path:60s} {e.code}  body[:200]={body!r}')
    except Exception as e:
        print(f'  {path:60s} ERROR {e}')