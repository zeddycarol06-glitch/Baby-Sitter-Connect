import { request } from "@/lib/api/client";
import type { Child, ParentProfile, User } from "@/types";

export async function getChildren(): Promise<Child[]> {
  return request<Child[]>({ url: "/parent/children" });
}

export interface ChildInput {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  allergies?: string[];
  specialNeeds?: string;
  notes?: string;
}

export async function createChild(payload: ChildInput): Promise<Child> {
  return request<Child>({ url: "/parent/children", method: "post", data: payload });
}

export async function updateChild(id: string, payload: Partial<ChildInput>): Promise<Child> {
  return request<Child>({ url: `/parent/children/${id}`, method: "patch", data: payload });
}

export async function deleteChild(id: string): Promise<{ ok: boolean }> {
  return request<{ ok: boolean }>({ url: `/parent/children/${id}`, method: "delete" });
}

export interface ParentProfileResponse {
  profile: ParentProfile;
  user: User;
}

export async function getParentProfile(): Promise<ParentProfileResponse> {
  return request<ParentProfileResponse>({ url: "/parent/profile" });
}

export async function updateParentProfile(
  payload: Partial<ParentProfile> & { firstName?: string; lastName?: string; phone?: string },
): Promise<ParentProfileResponse> {
  return request<ParentProfileResponse>({
    url: "/parent/profile",
    method: "patch",
    data: payload,
  });
}
