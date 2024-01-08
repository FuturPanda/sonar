import { supabase } from "../../supabase_client/client";

export const GET = async ({ request }) => {
  let followerId = request.headers.get("follower_id");
  let token = request.headers.get("token");
  let followeeId = request.headers.get("followee_id");
  let { data: followers, error } = await supabase
    .from("followers")
    .select("*")
    .match({ follower: followerId, followee: followeeId });

  /*
  let { data: followers, error } = await supabase
    .from("followers")
    .select("*")
    .or(`followee.eq.${userId}, follower.eq.${userId}`);*/

  if (!error) {
    return new Response(JSON.stringify({ relations: followers[0] }), {
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
      .eq("followee", followeeId);

    const { data: followResponse, error: errorUpsert } = await supabase
      .from("followers")
      .upsert([
        {
          followee: followeeId,
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
