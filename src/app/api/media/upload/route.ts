import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const ALLOWED_BUCKETS = new Set(["products", "blog", "banners", "avatars", "pages", "media"]);
const MAX_FILE_SIZE = 10 * 1024 * 1024;

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  // Check admin role
  const { data: profile } = await supabase
    .from("profiles")
    .select("role_id, roles(name)")
    .eq("id", user.id)
    .single();
  const roleData = (profile as { roles?: { name?: string } | { name?: string }[] | null } | null)?.roles;
  const roleName = Array.isArray(roleData) ? roleData[0]?.name : roleData?.name;
  if (roleName !== "admin" && roleName !== "super_admin") {
    return NextResponse.json({ error: "Only admins can upload media" }, { status: 403 });
  }

  const formData = await request.formData();
  const bucket = formData.get("bucket") as string;
  const files = formData.getAll("files") as File[];

  if (!bucket || !ALLOWED_BUCKETS.has(bucket)) {
    return NextResponse.json({ error: "Invalid bucket" }, { status: 400 });
  }

  if (!files || files.length === 0) {
    return NextResponse.json({ error: "No files provided" }, { status: 400 });
  }

  const errors: string[] = [];
  let uploaded = 0;

  for (const file of files) {
    if (file.size > MAX_FILE_SIZE) {
      errors.push(`${file.name}: over 10 MB`);
      continue;
    }
    if (!file.type.startsWith("image/")) {
      errors.push(`${file.name}: not an image`);
      continue;
    }

    // Generate a unique path: <uid>/<timestamp>-<filename>
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
    const path = `${user.id}/${fileName}`;

    const { error } = await supabase.storage
      .from(bucket)
      .upload(path, file, {
        contentType: file.type,
        cacheControl: "3600",
      });

    if (error) {
      errors.push(`${file.name}: ${error.message}`);
    } else {
      uploaded++;
    }
  }

  if (uploaded === 0 && errors.length > 0) {
    return NextResponse.json({ error: errors.join(" · ") }, { status: 400 });
  }

  return NextResponse.json({ uploaded, errors: errors.length > 0 ? errors : undefined });
}