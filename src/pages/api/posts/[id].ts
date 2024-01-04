import { supabase } from "../../../supabase_client/client";
import type { APIRoute } from "astro";

export const GET: APIRoute = async ({ params, request }) => {
  const id = params.id;
  let token = request.headers.get("token");
  let { data: userAuthenticated, error: errorLogin } = await supabase
    .from("users")
    .select("*")
    .eq("token", token);
  if (userAuthenticated.length > 0) {
    let { data: post, error } = await supabase
      .from("posts")
      .select()
      .eq("id", id);
    if (!error) {
      return new Response(
        JSON.stringify({
          post: post[0],
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
};

export const PUT: APIRoute = async ({ params, request }) => {
  const postId = params.id;
  const { userId, vote } = await request.json();

  let { data, error } = await supabase
    .from("reactions")
    .upsert([
      {
        user_id: userId,
        post_id: postId,
        vote: vote,
      },
    ])
    .select();

  if (!error) {
    return new Response(
      JSON.stringify({
        reaction: data,
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
