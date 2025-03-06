import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase"; // ✅ This should now work!

export async function POST(req) {
  try {
    const { email, password, name } = await req.json(); // Extract form data

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } },
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ user: data }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
