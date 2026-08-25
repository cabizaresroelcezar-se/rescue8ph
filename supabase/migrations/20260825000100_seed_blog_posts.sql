-- ============================================================================
-- SEED: Blog categories and demo posts for the storefront
-- ============================================================================
-- Idempotent: uses ON CONFLICT DO NOTHING / WHERE NOT EXISTS so it can be
-- safely re-run. Posts require at least one author profile (created by the
-- super_admin test seed in 20260824000100).
-- ============================================================================

-- Categories
insert into public.blog_categories (id, name, slug, description)
values
  ('a1111111-1111-1111-1111-111111111101', 'First Aid',     'first-aid',     'Practical first-aid tips, kit guides, and emergency-response basics.'),
  ('a1111111-1111-1111-1111-111111111102', 'EMS Equipment', 'ems-equipment', 'How to choose and maintain EMS gear for first responders.'),
  ('a1111111-1111-1111-1111-111111111103', 'Disaster Prep', 'disaster-prep', 'Earthquake, typhoon, and flood preparedness for the Philippines.'),
  ('a1111111-1111-1111-1111-111111111104', 'Training',      'training',      'Training program updates, certifications, and field stories.')
on conflict (id) do nothing;

-- Find the super_admin profile to use as the author of seed posts
do $$
declare
  author_id uuid;
begin
  select p.id into author_id
  from public.profiles p
  join public.roles r on r.id = p.role_id
  where r.name = 'super_admin'
  limit 1;

  if author_id is null then
    -- Fallback to any admin profile
    select p.id into author_id
    from public.profiles p
    join public.roles r on r.id = p.role_id
    where r.name in ('admin', 'super_admin')
    limit 1;
  end if;

  if author_id is null then
    raise notice 'No admin profile found; skipping blog seed posts.';
    return;
  end if;

  insert into public.blog_posts
    (id, title, slug, excerpt, content, status, category_id, author_id,
     seo_title, seo_description, published_at)
  values
    (
      'b1111111-1111-1111-1111-111111111101',
      'Building Your First-Aid Kit: A Philippine Field Guide',
      'building-first-aid-kit-philippine-field-guide',
      'What every home, school, and LGU kit should include — calibrated for the kinds of incidents we actually respond to in the Philippines.',
      E'## Why a purpose-built first-aid kit matters\n\nA standard first-aid kit can fail at the worst moment — when a bandage falls off in the rain, when a tourniquet is missing because no one thought to add one, or when a tablet expires unnoticed.\n\n## The core of a Philippine-ready kit\n\nFor our climate and incident types, every kit should include:\n\n- **Bleeding control** — tourniquet, hemostatic gauze, pressure dressings\n- **Basic wound care** — assorted bandages, antiseptic, gauze, tape\n- **CPR & airway** — face shield, pocket mask\n- **Heat & hydration** — oral rehydration salts, electrolyte sachets\n- **Tools** — trauma shears, gloves, marker, whistle\n\n## Storage tips\n\nStore in a waterproof container. Check expiration dates every 6 months. Keep a smaller "go-bag" version in your vehicle.\n\n## Where to buy\n\nRescue 8 Philippines stocks complete kits for **home, school, vehicle, and LGU** use. We also accept bulk orders for institutional buyers.\n\n---\n\nNeed help choosing the right kit? [Contact us](/contact) and our team can recommend a configuration based on your use case.',
      'PUBLISHED',
      'a1111111-1111-1111-1111-111111111101',
      author_id,
      'Building Your First-Aid Kit: A Philippine Field Guide',
      'A practical guide to assembling a first-aid kit for Philippine homes, schools, and LGUs.',
      now() - interval '7 days'
    ),
    (
      'b1111111-1111-1111-1111-111111111102',
      'AED Placement: Where Schools and Offices Should Install One',
      'aed-placement-schools-offices',
      'Strategic AED placement can double survival rates for sudden cardiac arrest. Here is how to pick the right spot.',
      E'## Why location matters\n\nAEDs are most effective when used within **3–5 minutes** of collapse. Every minute of delay reduces survival by ~10%.\n\n## Best placement guidelines\n\n- **High-traffic zones** — lobbies, cafeterias, gyms\n- **Near elevators and stairs** — easily visible from main corridors\n- **Outdoor venues** — near pools, sports fields\n- **Marked and unlocked** — visible signage, accessible during off-hours\n\n## Maintenance checklist\n\n- Battery self-test (monthly)\n- Pad expiration check (every 2 years)\n- Quick visual inspection (weekly)\n\nRescue 8 supplies FDA-aligned AEDs and offers **maintenance contracts** for schools and offices nationwide.',
      'PUBLISHED',
      'a1111111-1111-1111-1111-111111111102',
      author_id,
      'AED Placement: Where Schools and Offices Should Install One',
      'Best practices for AED placement in Philippine schools and offices.',
      now() - interval '14 days'
    ),
    (
      'b1111111-1111-1111-1111-111111111103',
      'Typhoon Preparedness: 72-Hour Kits for Filipino Families',
      'typhoon-preparedness-72-hour-kits',
      'A family-ready emergency kit that covers water, food, light, communication, and first aid for at least three days.',
      E'## The 72-hour rule\n\nWhen a typhoon makes landfall, relief may take **up to 72 hours** to reach the hardest-hit barangays. Your family should be ready to be self-sufficient during that window.\n\n## What to include\n\n- Water — 4 liters per person per day\n- Food — non-perishable, ready-to-eat\n- Light — flashlight + extra batteries\n- Communication — battery radio, power bank\n- First aid — compact trauma + medication kit\n- Documents — sealed copies in waterproof pouch\n\n## Pets and dependents\n\nDon\'t forget supplies for infants, elderly family members, and pets.\n\n---\n\nWe carry complete 72-hour family kits and can customize for your household size. [Shop kits](/products) or [contact us](/contact) for bulk orders.',
      'PUBLISHED',
      'a1111111-1111-1111-1111-111111111103',
      author_id,
      'Typhoon Preparedness: 72-Hour Kits for Filipino Families',
      'Build a 72-hour emergency kit tailored to Philippine typhoon conditions.',
      now() - interval '21 days'
    ),
    (
      'b1111111-1111-1111-1111-111111111104',
      'Stop the Bleed: How Bystanders Can Save Lives',
      'stop-the-bleed-bystander-first-responder',
      'Severe bleeding can kill in minutes. Here is what every bystander can do before help arrives.',
      E'## The window is small\n\nA person can bleed out from a serious wound in **under 5 minutes**. Bystanders who know what to do can be the difference between life and death.\n\n## Three steps to Stop the Bleed\n\n1. **Apply direct pressure** — Use both hands and a clean cloth\n2. **Pack the wound** — Push gauze deep into the source of bleeding\n3. **Apply a tourniquet** — 2–3 inches above the wound, never on a joint\n\n## Training matters\n\nHands-on practice builds the muscle memory you\'ll need under stress. Rescue 8 offers **Stop the Bleed** workshops for schools, LGUs, and corporate offices.\n\n---\n\n[Request a training schedule](/contact) — we deliver on-site or at our Quezon City training facility.',
      'PUBLISHED',
      'a1111111-1111-1111-1111-111111111104',
      author_id,
      'Stop the Bleed: How Bystanders Can Save Lives',
      'A bystander-friendly guide to controlling severe bleeding.',
      now() - interval '30 days'
    ),
    (
      'b1111111-1111-1111-1111-111111111105',
      'Choosing the Right Fire Extinguisher for Your Workplace',
      'choosing-fire-extinguisher-workplace',
      'Classes A through K, placement, and inspection — a quick reference for facility managers.',
      E'## The five classes you need to know\n\n- **Class A** — ordinary combustibles (wood, paper, cloth)\n- **Class B** — flammable liquids (gasoline, oil)\n- **Class C** — flammable gases\n- **Class D** — combustible metals\n- **Class K** — cooking oils and fats\n\n## Workplace recommendations\n\n- **Offices** — Class ABC dry chemical\n- **Kitchens & pantries** — Class K wet chemical\n- **Server rooms** — Class C clean agent\n- **Industrial** — Class ABC + D depending on process\n\n## Inspection basics\n\n- Visual check — gauge pressure, accessibility (monthly)\n- Professional service — annually\n- Hydrostatic test — every 5–12 years\n\nRescue 8 supplies **commercial-grade extinguishers** and offers installation + annual inspection contracts.',
      'PUBLISHED',
      'a1111111-1111-1111-1111-111111111104',
      author_id,
      'Choosing the Right Fire Extinguisher for Your Workplace',
      'A practical guide to fire extinguisher classes, placement, and inspection.',
      now() - interval '40 days'
    )
  on conflict (id) do nothing;
end $$;