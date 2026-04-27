export interface UserAdminDto {
  id: string;
  name: string;
  email: string;
  image?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface UpdateUserPayload {
  name?: string;
  image?: string;
}
