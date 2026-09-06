export type User = {
  id: number;
  name: string;
  email: string;
};

export type RegisterData = {
  name: string;
  company_name: string,
  email: string;
  password: string;
  password_confirmation: string;
};

export type LoginData = {
  email: string;
  password: string;
};