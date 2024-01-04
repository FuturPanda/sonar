export type signUpDTO = {
  email: string;
  password: string;
};

export type updateUserDTO = {
  user_id: string;
  updates: JSON;
};

export type upsertPostDto = {
  token: string;
  post: postDto;
};

export type updatePostDto = {
  token: string;
  id: Int32Array;
  post: postDto;
};

export type postDto = {
  url: string;
  author: string;
  tldr: string;
  title: string;
};
