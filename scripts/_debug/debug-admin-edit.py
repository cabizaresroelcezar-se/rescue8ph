"""Sign in via Supabase and access /admin/pages/<uuid> with the session cookie."""
import json
import urllib.request
import urllib.parse
import urllib.error
import http.cookiejar

env = {}
with open('.env.local') as f:
    for line in f:
        line = line.strip()
        if line and not line.startswith('#') and '=' in line:
            k, v = line.split('=', 1)
            env[k] = v

url = env['NEXT_PUBLIC_SUPABASE_URL'].rstrip('/')
anon_key = env['NEXT_PUBLIC_SUPABASE_ANON_KEY']
if not anon_key:
    # try the service role as a fallback (won't work for actual auth, but tells us about the key)
    print('No anon key in .env.local')
    exit()

# Get admin user email from profiles
key = env['SUPABASE_SERVICE_ROLE_KEY']
req = urllib.request.Request(
    url + '/rest/v1/profiles?role_id=eq.54a43f84-7319-44e2-b560-a8b8e9fadbf7&select=id',
    headers={'apikey': key, 'Authorization': 'Bearer ' + key}
)
admins = json.loads(urllib.request.urlopen(req).read())
if not admins:
    print('No admin users found')
    exit()
admin_id = admins[0]['id']

# Get admin's email from auth.users via service role
req = urllib.request.Request(
    url + '/auth/v1/admin/users/' + admin_id,
    headers={'apikey': key, 'Authorization': 'Bearer ' + key}
)
try:
    user_data = json.loads(urllib.request.urlopen(req).read())
    email = user_data.get('email')
    print(f'Admin email: {email}')
except Exception as e:
    print(f'Error getting admin email: {e}')
    exit()