import { supabase } from "../../supabase_client/client";
import type { APIRoute } from "astro";

export const GET: APIRoute = async ({ request }) => {
  const { userId } = await request.json();
  let { data: followers, error } = await supabase
    .from("followers")
    .select("*")
    .eq("user", userId);

  if (!error) {
    return new Response(JSON.stringify({ followers: followers }), {
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

export const POST: APIRoute = async ({ request }) => {
  const { userId, followerId } = await request.json();

  const { data: following, error: errorFollow } = await supabase
    .from("followers")
    .select("is_following")
    .eq("follower", followerId)
    .eq("user", userId);

  const { data, error: errorUpsert } = await supabase
    .from("followers")
    .upsert([
      {
        user: userId,
        follower: followerId,
        is_following: following.length > 0 ? true : !following[0]?.is_following,
      },
    ])
    .select();

  if (!errorFollow && !errorUpsert) {
    return new Response(
      JSON.stringify({
        data: data,
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
