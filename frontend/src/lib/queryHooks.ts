// TanStack Query hooks wrapping the ApiClient.
import { QueryClient, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "./createApiClient";
import type { PathwayInput } from "./apiClient";
import type {
  CareerId,
  CourseId,
  CourseSource,
  Profile,
  ProfileId,
  ProfilePatch,
} from "./types";

export const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, refetchOnWindowFocus: false } },
});

export const queryKeys = {
  profile: (id: ProfileId) => ["profile", id] as const,
  plans: (id: ProfileId) => ["plans", id] as const,
  skills: (q: string) => ["catalog", "skills", q] as const,
  courses: (q: string, s?: CourseSource) => ["catalog", "courses", q, s ?? ""] as const,
  careers: (q: string) => ["catalog", "careers", q] as const,
  radar: (careerId: CareerId, courseIds: CourseId[]) =>
    ["radar", careerId, [...courseIds].sort().join(",")] as const,
  pathway: (input: PathwayInput) =>
    ["pathway", input.careerId, [...input.completedCourseIds].sort().join(","), input.startTerm ?? ""] as const,
};

export function useCreateOrLoadProfile() {
  return useMutation<Profile, { code: string; message: string }, string>({
    mutationFn: (username: string) => apiClient.createOrLoadProfile(username),
  });
}

export function useProfile(id: ProfileId | null) {
  return useQuery({
    queryKey: queryKeys.profile(id ?? ""),
    queryFn: () => apiClient.getProfile(id as ProfileId),
    enabled: !!id,
  });
}

export function useUpdateProfile(id: ProfileId | null) {
  const qc = useQueryClient();
  return useMutation<Profile, { code: string; message: string }, ProfilePatch>({
    mutationFn: (patch: ProfilePatch) => apiClient.updateProfile(id as ProfileId, patch),
    onSuccess: (profile) => {
      qc.setQueryData(queryKeys.profile(profile.id), profile);
      qc.invalidateQueries({ queryKey: ["radar"] });
      qc.invalidateQueries({ queryKey: ["pathway"] });
    },
  });
}

export function useProfilePlans(id: ProfileId | null) {
  return useQuery({
    queryKey: queryKeys.plans(id ?? ""),
    queryFn: () => apiClient.listPlans(id as ProfileId),
    enabled: !!id,
  });
}

export function useSavePlan(id: ProfileId | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (plan: Parameters<typeof apiClient.savePlan>[1]) =>
      apiClient.savePlan(id as ProfileId, plan),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.plans(id ?? "") }),
  });
}

export function useSearchSkills(query: string) {
  return useQuery({
    queryKey: queryKeys.skills(query),
    queryFn: () => apiClient.searchSkills(query),
  });
}

export function useSearchCourses(query: string, source?: CourseSource) {
  return useQuery({
    queryKey: queryKeys.courses(query, source),
    queryFn: () => apiClient.searchCourses(query, source),
  });
}

export function useSearchCareers(query: string) {
  return useQuery({
    queryKey: queryKeys.careers(query),
    queryFn: () => apiClient.searchCareers(query),
  });
}

export function useRadar(careerId: CareerId | null, completedCourseIds: CourseId[]) {
  return useQuery({
    queryKey: queryKeys.radar(careerId ?? "", completedCourseIds),
    queryFn: () => apiClient.getRadar(careerId as CareerId, completedCourseIds),
    enabled: !!careerId,
  });
}

export function usePathway(input: PathwayInput | null) {
  return useQuery({
    queryKey: input ? queryKeys.pathway(input) : ["pathway", "none"],
    queryFn: () => apiClient.getPathway(input as PathwayInput),
    enabled: !!input,
  });
}
