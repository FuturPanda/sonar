import { supabase } from "../../../supabase_client/client";

//const { data, error } = await supabase.auth.admin.getUserById(1);

import type { APIRoute } from "astro";
import type { signUpDTO } from "../dtos";
import { createNewJWToken, encrypt } from "../jwt";

export const POST: APIRoute = async ({ request }) => {
  const { email, password }: signUpDTO = await request.json();
  const accesToken = createNewJWToken(email);
  const cipheredPassword = encrypt(password);

  const { data, error } = await supabase
    .from("users")
    .insert([{ email: email, password: cipheredPassword, token: accesToken }])
    .select();

  if (!error) {
    return new Response(
      JSON.stringify({ id: data[0].id, token: data[0].token }),
      {
        status: 200,
        headers: { "Content-type": "application/json" },
      }
    );
  } else {
    return new Response(JSON.stringify({ message: error.message }), {
      status: 400,
      headers: { "Content-type": "application/json" },
    });
  }
};
