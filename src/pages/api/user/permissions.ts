import { supabase } from "../../../supabase_client/client";
import type { APIRoute } from "astro";

export const POST: APIRoute = async ({ request }) => {
  let userId = request.headers.get("user_id");
  let role = request.headers.get("role");

  const { data, error } = await supabase
    .from("user_role")
    .insert([{ user: userId, role: role }])
    .select();

  if (!error) {
    return new Response(null, {
      status: 200,
      headers: { "Content-type": "application/json" },
    });
  } else {
    return new Response(JSON.stringify({ message: error.message }), {
      status: 400,
      headers: { "Content-type": "application/json" },
    });
  }
};

export const DELETE: APIRoute = async ({ request }) => {
  let userId = request.headers.get("user_id");
  let role = request.headers.get("role");

  const { error } = await supabase
    .from("user_role")
    .delete()
    .eq("user", userId)
    .eq("role", role);

  if (!error) {
    return new Response(null, {
      status: 200,
      headers: { "Content-type": "application/json" },
    });
  } else {
    return new Response(JSON.stringify({ message: error.message }), {
      status: 400,
      headers: { "Content-type": "application/json" },
    });
  }
};
