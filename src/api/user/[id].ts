import { supabase } from "../../../supabase_client/client";
import type { APIRoute } from "astro";

export const GET: APIRoute = async ({ params, request }) => {
  const id = params.id;
  let { data: profiles, error } = await supabase
    .from("profiles")
    .select()
    .eq("id", id);
  if (!error) {
    return new Response(
      JSON.stringify({
        profile: profiles,
        id: id,
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
