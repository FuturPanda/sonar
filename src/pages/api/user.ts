import { supabase } from "../../supabase_client/client";
import type { APIRoute } from "astro";
import type { upsertPostDto } from "./dtos";

export const GET: APIRoute = async ({ request }) => {
  let userId = request.headers.get("user_id");
  let token = request.headers.get("token");
  let { data: userAuthenticated, error: errorLogin } = await supabase
    .from("users")
    .select("*")
    .eq("token", token);
  if (userAuthenticated.length > 0) {
    let { data: profiles, error } = await supabase
      .from("profiles")
      .select("*,roles_permissions:users(roles(name, permissions(name)))")
      .eq("id", userId);
    if (!error) {
      return new Response(
        JSON.stringify({
          profile: profiles[0],
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

// export const GET: APIRoute = async ({ request }) => {
//   let { token } = await request.json();
//   let { data: userAuthenticated, error: errorLogin } = await supabase
//     .from("users")
//     .select("*")
//     .eq("token", token);
//   if (userAuthenticated.length > 0) {
//     let { data: posts, error } = await supabase.from("posts").select("*");
//     if (!error) {
//       return new Response(JSON.stringify({ posts: posts }), {
//         status: 200,
//         headers: { "Content-type": "application/json" },
//       });
//     } else {
//       return new Response(JSON.stringify({ message: error.message }), {
//         status: 400,
//         headers: { "Content-type": "application/json" },
//       });
//     }
//   } else if (!errorLogin) {
//     return new Response(JSON.stringify({ message: "token invalid" }), {
//       status: 401,
//       headers: { "Content-type": "application/json" },
//     });
//   } else {
//     return new Response(JSON.stringify({ message: errorLogin.message }), {
//       status: 400,
//       headers: { "Content-type": "application/json" },
//     });
//   }
// };

export const POST: APIRoute = async ({ request }) => {
  const { token, post }: upsertPostDto = await request.json();

  let { data: idUser, error: userError } = await supabase
    .from("users")
    .select("id")
    .eq("token", token);

  if (!userError && idUser.length > 0) {
    const { data, error } = await supabase
      .from("posts")
      .insert({
        author: post.author,
        url: post.url,
        tldr: post.tldr,
        title: post.title,
      })
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

export const PUT: APIRoute = async ({ request }) => {
  const { token, id, updates } = await request.json();

  let { data: idUser, error: userError } = await supabase
    .from("users")
    .select("id")
    .eq("token", token);

  if (!userError && idUser.length > 0) {
    const { data, error } = await supabase
      .from("profiles")
      .update({
        username: updates.username,
        full_name: updates.full_name,
        avatar_url: updates.avatar_url,
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
