export interface ReqresLoginResponse {
  token: string;
}

export interface ReqresUser {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  avatar: string;
}

export interface ReqresGetUserResponse {
  data: ReqresUser;
}
