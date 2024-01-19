import { supabase } from "../../../supabase_client/client";
export const POST = async ({ request }) => {
  const { comment, idPost, idUser } = await request.json();

  const { data, error } = await supabase
    .from("comments")
    .insert([{ post_id: idPost, comment: comment, user_id: idUser }])
    .select();
  console.log(data);
  console.log(error);

  if (!error) {
    return new Response(
      JSON.stringify({
        comment: data[0],
      }),
      {
        status: 200,
        headers: { "Content-type": "application/json" },
      }
    );
  } else {
    return new Response(JSON.stringify({}), {
      status: 403,
      headers: { "Content-type": "application/json" },
    });
  }
};
