import { supabase } from "../../supabase_client/client";

export const GET = async ({ request }) => {
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

export const POST = async ({ request }) => {
  const { followeeId, followerId, token } = await request.json();

  let { data: userAuthenticated, error: errorLogin } = await supabase
    .from("users")
    .select("*")
    .eq("token", token);

  if (userAuthenticated.length > 0) {
    const { data: following, error: errorFollow } = await supabase
      .from("followers")
      .select("is_following")
      .eq("follower", followerId)
      .eq("user", followeeId);

    const { data: followResponse, error: errorUpsert } = await supabase
      .from("followers")
      .upsert([
        {
          user: followeeId,
          follower: followerId,
          is_following:
            following?.length < 0 ? true : !following[0]?.is_following,
        },
      ])
      .select();

    if (!errorFollow && !errorUpsert) {
      return new Response(
        JSON.stringify({
          follow_state: followResponse[0],
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
  } else {
    return new Response(JSON.stringify({ message: "error.message" }), {
      status: 400,
      headers: { "Content-type": "application/json" },
    });
  }
};
