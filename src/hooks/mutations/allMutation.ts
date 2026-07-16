import { useMutation, useQueryClient } from "@tanstack/react-query";
import { patch_requests, post_request_with_image, put_request_with_image } from "../helper/AxioHelper";


export const useCreateMentor = () => {
  const queryClient = useQueryClient()

  const createMentor = useMutation({
    mutationFn: async (data: any) => {
      const token = (await localStorage.getItem("betamindToken")) || ""
      return post_request_with_image('mentors/', data, token)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mentors"] })
    },
  })

  return createMentor
}


export const useUpdateMentorProfile = () => {
  const queryClient = useQueryClient()

  const updateMentorProfile = useMutation({
    mutationFn: async (data: any) => {
      const token = (await localStorage.getItem("betamindToken")) || ""
      return patch_requests('mentors/me/', data, token)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myMentorProfile"] })
    },
  })

  return updateMentorProfile
}



export const useUpdateUserProfile = () => {
  const queryClient = useQueryClient()

  const updateUserProfile = useMutation({
    mutationFn: async (data: any) => {
      const token = (await localStorage.getItem("betamindToken")) || ""
      return put_request_with_image('profiles/me/', data, token)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myProfile"] })
    },
  })

  return updateUserProfile
}