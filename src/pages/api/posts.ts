import { supabase } from "../../supabase_client/client";
import type { APIRoute } from "astro";
import type { upsertPostDto, updatePostDto } from "./dtos";

export const GET: APIRoute = async ({ request }) => {
  let token = request.headers.get("token");
  let { data: userAuthenticated, error: errorLogin } = await supabase
    .from("users")
    .select("*")
    .eq("token", token);

  if (userAuthenticated.length > 0) {
    let { data: posts, error } = await supabase
      .from("posts")
      .select("*, author(profiles(*)), reactions(*), comments(*, profiles(*))")
      .order("created_at", { ascending: false });

    /*let { data: upVotes, error: errorUpvotes } = await supabase
      .from("posts")
      .select("id, reactions(*), count:reactions(count)")
      .eq("reactions.vote", "UPVOTE");

    let { data: downVotes, error: errorDownvotes } = await supabase
      .from("posts")
      .select("id, reactions(*), count:reactions(count)")
      .eq("reactions.vote", "DOWNVOTE");*/

    if (!error) {
      return new Response(
        JSON.stringify({
          posts: posts,
          //upvotes: upVotes,
          //downvotes: downVotes,
        }),
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
  } else if (!errorLogin) {
    return new Response(JSON.stringify({ message: "token invalid" }), {
      status: 401,
      headers: { "Content-type": "application/json" },
    });
  } else {
    return new Response(JSON.stringify({ message: errorLogin.message }), {
      status: 400,
      headers: { "Content-type": "application/json" },
    });
  }
};

export const POST: APIRoute = async ({ request }) => {
  let token = request.headers.get("token");
  const { author, url, title, tldr, imageUrl } = await request.json();

  let { data: idUser, error: userError } = await supabase
    .from("users")
    .select("id")
    .eq("token", token);

  if (!userError && idUser.length > 0) {
    const { data, error } = await supabase
      .from("posts")
      .insert({
        author: author,
        url: url,
        tldr: tldr,
        title: title,
        url_image: imageUrl,
      })
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
  } else {
    return new Response(JSON.stringify({ message: "Unhautorized" }), {
      status: 401,
      headers: { "Content-type": "application/json" },
    });
  }
};

export const PUT: APIRoute = async ({ request }) => {
  const { token, id, post } = await request.json();

  let { data: idUser, error: userError } = await supabase
    .from("users")
    .select("id")
    .eq("token", token);

  if (!userError && idUser.length > 0) {
    const { data, error } = await supabase
      .from("posts")
      .update({
        author: post.author,
        url: post.url,
        tldr: post.tldr,
        title: post.title,
        url_image: post.url_image,
      })
      .eq("id", id)
      .select();

    if (!error) {
      return new Response(JSON.stringify({ userInfo: data }), {
        status: 200,
        headers: { "Content-type": "application/json" },
      });
    } else {
      return new Response(JSON.stringify({ message: error.message }), {
        status: 400,
        headers: { "Content-type": "application/json" },
      });
    }
  } else {
    return new Response(JSON.stringify({ message: "Unhautorized" }), {
      status: 401,
      headers: { "Content-type": "application/json" },
    });
  }
};

export const DELETE: APIRoute = async ({ request }) => {
  let token = request.headers.get("token");
  let idPost = request.headers.get("id_post");

  let { data: idUser, error: userError } = await supabase
    .from("users")
    .select("id")
    .eq("token", token);

  if (!userError && idUser.length > 0) {
    const { error } = await supabase.from("posts").delete().eq("id", idPost);

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
  } else {
    return new Response(JSON.stringify({ message: "Unhautorized" }), {
      status: 401,
      headers: { "Content-type": "application/json" },
    });
  }
};
