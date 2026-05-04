export type User = {
  _id: string;
  username: string;
  email: string;
};

export type AuthResponse = {
  token: string;
  user: User;
};

export type SignupPayload = {
  username: string;
  email: string;
  password: string;
};

export type LoginPayload = {
  email: string;
  password: string;
};
