import { supabase } from "../../../supabase_client/client";
import type { APIRoute } from "astro";
import { createNewJWToken, decrypt, encrypt } from "../jwt";
import type { signUpDTO } from "../dtos";

export const POST: APIRoute = async ({ request }) => {
  const { email, password } = await request.json();

  let { data, error } = await supabase
    .from("users")
    .select("password, id")
    .eq("email", email);

  const decipheredPW = decrypt(data[0].password);
  const accessToken = createNewJWToken(email);

  if (!error) {
    if (password == decipheredPW) {
      const { data: user, error } = await supabase
        .from("users")
        .update({ token: accessToken })
        .eq("email", email)
        .select("token, id");

      let { data: user_role, error: error2 } = await supabase
        .from("user_role")
        .select("role(permissions(name))")
        .eq("user", data[0].id);
      if (!error && !error2) {
        return new Response(
          JSON.stringify({
            token: user[0].token,
            id: user[0].id,
            roles: user_role,
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
    }
  } else {
    return new Response(JSON.stringify({ message: "error.message" }), {
      status: 400,
      headers: { "Content-type": "application/json" },
    });
  }
};

export const PUT: APIRoute = async ({ request }) => {
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
