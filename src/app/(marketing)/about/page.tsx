export const metadata = { title: "About Us" };

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="text-3xl font-bold tracking-tight">About Rescue 8 Philippines</h1>

      <div className="mt-8 space-y-6 text-muted-foreground">
        <p>
          Rescue 8 Trading Philippines, Inc. has been a trusted supplier of
          Emergency Medical Services (EMS), rescue, safety, and first aid
          equipment since February 2012. We are registered with the Department
          of Trade and Industry (DTI) and headquartered in Quezon City.
        </p>

        <p>
          Our mission is simple: to provide EMS and Rescue Equipment, Emergency
          Disaster Preparedness and Rescue Equipment. We equip first responders,
          government agencies, local government units (LGUs), hospitals, private
          companies, and organizations across the Philippines with reliable,
          field-tested emergency equipment.
        </p>

        <div className="rounded-lg border bg-surface p-6">
          <h2 className="text-xl font-bold text-foreground">Our Story</h2>
          <p className="mt-3">
            Founded by Allan Cabizares, an Emergency Medical Technician and
            International Trauma Life Support Advanced Provider Course
            Instructor, Rescue 8 was born from firsthand experience in the
            field. We understand the critical importance of reliable equipment
            in life-or-death situations, and we source only the best products
            for our customers.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-3">
          <div className="rounded-lg border p-6">
            <p className="text-3xl font-bold text-primary">2012</p>
            <p className="mt-1 text-sm">Founded and DTI registered</p>
          </div>
          <div className="rounded-lg border p-6">
            <p className="text-3xl font-bold text-primary">Nationwide</p>
            <p className="mt-1 text-sm">Delivery across the Philippines</p>
          </div>
          <div className="rounded-lg border p-6">
            <p className="text-3xl font-bold text-primary">100+</p>
            <p className="mt-1 text-sm">Government and corporate clients served</p>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-bold text-foreground">What We Do</h2>
          <ul className="mt-3 space-y-2">
            <li>• Supply EMS equipment including AEDs, oxygen systems, and patient monitoring devices</li>
            <li>• Provide rescue equipment: stretchers, spine boards, extraction tools, and rescue harnesses</li>
            <li>• Customize first aid kits for homes, offices, vehicles, and field operations</li>
            <li>• Equip fire safety: fire extinguishers, fire suits, and fire prevention gear</li>
            <li>• Supply disaster preparedness kits and survival gear</li>
            <li>• Provide training equipment: CPR manikins, training AEDs, and simulation tools</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-bold text-foreground">Our Clients</h2>
          <p className="mt-3">
            We proudly serve first responders, emergency medical personnel,
            government agencies, LGUs, hospitals, search and rescue teams,
            industrial and construction companies, schools, and private
            organizations throughout the Philippines.
          </p>
        </div>

        <div className="rounded-lg border bg-primary p-6 text-center text-white">
          <h2 className="text-xl font-bold">Contact Us</h2>
          <p className="mt-2 text-white/80">
            Unit G4 #65 Gasan, Brgy Masambong, Quezon City
          </p>
          <p className="mt-1 text-white/80">Phone: (02) 622-9565</p>
          <a
            href="/contact"
            className="mt-4 inline-flex h-10 items-center justify-center rounded-lg bg-accent px-6 text-sm font-semibold text-white hover:bg-accent/90"
          >
            Get in Touch
          </a>
        </div>
      </div>
    </div>
  );
}