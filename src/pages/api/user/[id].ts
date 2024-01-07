import { supabase } from "../../../supabase_client/client";
import type { APIRoute } from "astro";

export const GET: APIRoute = async ({ request }) => {
  let userId = request.headers.get("userId");
  let token = request.headers.get("token");

  let { data: profiles, error } = await supabase
    .from("profiles")
    .select()
    .eq("id", userId);
  if (!error) {
    return new Response(
      JSON.stringify({
        profile: profiles,
        id: userId,
      }),
      {
        status: 200,
        headers: { "Content-type": "application/json" },
      }
    );
  } else {
    return new Response(JSON.stringify({ message: "error.message" }), {
      status: 400,
      headers: { "Content-type": "application/json" },
    });
  }
};
