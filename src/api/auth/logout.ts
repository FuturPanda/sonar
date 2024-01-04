/*import { supabase } from "../../../supabase_client/client";
import type { APIRoute } from "astro";
import type { updateUserDTO } from "../dtos";
import { createNewJWToken, decrypt } from "../jwt";

export const POST: APIRoute = async ({ request }) => {
  const { user_id: userId } = await request.json();

  const { data, error } = await supabase
    .from("users")
    .update({ token: null })
    .eq("id", userId)
    .select();

  if (!error) {
    return new Response(
      JSON.stringify({
        message: "user have been logged out",
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
};*/
