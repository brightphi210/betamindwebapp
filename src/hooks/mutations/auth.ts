import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { get_requests, post_requests, put_request_with_image } from "../helper/AxioHelper";


export const useSendGoogleToken = () => {
  const googleMutation = useMutation({
    mutationFn: (data: any) => post_requests("auth/google/", data),
  });

  return googleMutation;
};


export const useRegistration = () => {
  const registrationMutation = useMutation({
    mutationFn: (data: any) => post_requests("fincanceRecord/signup", data),
  });

  return registrationMutation;
};


export const useLogin = () => {
  const loginMutation = useMutation({
    mutationFn: (data: any) => post_requests("fincanceRecord/login", data),
  });

  return loginMutation;
};

export const useProfile = () => {
  const { data, isLoading, isError, isFetched, refetch } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const token = (await localStorage.getItem("accessToken")) || "";
      return get_requests("profile/", token);
    },
  });

  return {
    profile: data,
    isLoading,
    isError,
    isFetched,
    refetch,
  };
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient()

  const updateProfile = useMutation({
    mutationFn: async (data: any) => {
      const token = (await localStorage.getItem("accessToken")) || ""
      return put_request_with_image(`profile/update/`, data, token)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] })
    },
  })

  return updateProfile
}


