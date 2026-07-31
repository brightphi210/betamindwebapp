import { useMutation, useQueryClient } from "@tanstack/react-query";
import { post_request_with_image, post_requests, put_request_with_image } from "../helper/AxioHelper";


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
      return put_request_with_image('mentors/me/', data, token)
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




// =============== CREATE EVENTS ====================
export const useCreateEvents = () => {
  const queryClient = useQueryClient()

  const createEvent = useMutation({
    mutationFn: async (data: any) => {
      const token = (await localStorage.getItem("betamindToken")) || ""
      return post_request_with_image('events/', data, token)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] })
    },
  })

  return createEvent
}


export const useRegisterEvents = () => {
  const queryClient = useQueryClient()

  const createEventAttendance = useMutation({
    mutationFn: async (data: any) => {
      const token = (await localStorage.getItem("betamindToken")) || ""
      return post_requests('events/create-attendee/', data, token)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] })
    },
  })

  return createEventAttendance
}



// ================ CREATE PRODUCT =================

export const useCreateDigitalProduct = () => {
  const queryClient = useQueryClient()

  const createDigitalProduct = useMutation({
    mutationFn: async (data: any) => {
      const token = (await localStorage.getItem("betamindToken")) || ""
      return post_request_with_image('digital-products/', data, token)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] })
    },
  })

  return createDigitalProduct
}


// ============== Book Mentor Session ============
export const useBookMentorship = () => {
  const queryClient = useQueryClient()

  const bookMentorship = useMutation({
    mutationFn: async (data: any) => {
      const token = (await localStorage.getItem("betamindToken")) || ""
      return post_requests('sessions/', data, token)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookMentorship", "mentorProfile"] })
    },
  })

  return bookMentorship
}
