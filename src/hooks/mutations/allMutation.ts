import { useMutation, useQueryClient } from "@tanstack/react-query";
import { delete_requests, patch_requests, post_request_with_image, post_requests, put_request_with_image, put_request_with_image_compressed, put_requests } from "../helper/AxioHelper";


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




// =============== CREATE EVENTS ====================
// export const useCreateEvents = () => {
//   const queryClient = useQueryClient()

//   const createEvent = useMutation({
//     mutationFn: async (data: any) => {
//       const token = (await localStorage.getItem("betamindToken")) || ""
//       return post_request_with_image('events/', data, token)
//     },
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ["events"] })
//     },
//   })

//   return createEvent
// }


type CreateEventVars =
  | FormData
  | object
  | { data: FormData | object; onUploadProgress: (e: { loaded: number; total?: number }) => void }

export const useCreateEvents = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (vars: CreateEventVars) => {
      const token = (await localStorage.getItem("betamindToken")) || ""

      const wrapped =
        vars && typeof vars === "object" && !(vars instanceof FormData) && "onUploadProgress" in vars
      const data = wrapped ? (vars as any).data : vars
      const onUploadProgress = wrapped ? (vars as any).onUploadProgress : undefined

      return put_request_with_image_compressed("events/", data, token, onUploadProgress)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] })
    },
  })
}


// Replace useDeleteEvents with this. Id is passed at call time: deleteEvent(event.id, {...})
export const useDeleteEvent = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const token = localStorage.getItem("betamindToken") || ""
      // use whatever your DELETE helper is called (same file as put_requests)
      return delete_requests(`events/${id}/`, token)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] })
    },
  })
}

// Keep, just also invalidate the single-event query
export const useEditEvents = (id: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: any) => {
      const token = localStorage.getItem("betamindToken") || ""
      return put_requests(`events/${id}/`, data, token)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] })
      queryClient.invalidateQueries({ queryKey: ["event", id] })
    },
  })
}

export const useDeleteDigitalProduct = (id: any) => {
  const queryClient = useQueryClient()

  const deleteDigitalProduct = useMutation({
    mutationFn: async () => {
      const token = (await localStorage.getItem("betamindToken")) || ""
      return delete_requests(`digital-products/${id}/`, token)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["digital-products"] })
    },
  })

  return deleteDigitalProduct
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

export const usePayEventTicket = () => {
  const queryClient = useQueryClient()

  const payEventTicket = useMutation({
    mutationFn: async ({ eventId, data }: { eventId: string; data: any }) => {
      const token = (await localStorage.getItem("betamindToken")) || ""
      return post_requests(`events/${eventId}/pay/`, data, token)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] })
    },
  })

  return payEventTicket
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


export const useCreateIndividualSession = () => {
  const queryClient = useQueryClient()

  const createIndividualSession = useMutation({
    mutationFn: async (data: any) => {
      const token = (await localStorage.getItem("betamindToken")) || ""
      return post_request_with_image('individual-sessions/', data, token)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["individualSessions"] })
    },
  })

  return createIndividualSession
}

export const useEditIndividualSession = (id: string) => {
  const queryClient = useQueryClient()

  const editIndividualSession = useMutation({
    mutationFn: async (data: any) => {
      const token = (await localStorage.getItem("betamindToken")) || ""
      return put_requests(`individual-sessions/${id}/`, data, token)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["individualSessions"] })
    },
  })

  return editIndividualSession
}

export const useDeleteIndividualSession = (id: string) => {
  const queryClient = useQueryClient()

  const deleteIndividualSession = useMutation({
    mutationFn: async () => {
      const token = (await localStorage.getItem("betamindToken")) || ""
      return delete_requests(`individual-sessions/${id}/`, token)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["individualSessions"] })
    },
  })

  return deleteIndividualSession
}

export const useCreateGroupSession = () => {
  const queryClient = useQueryClient()

  const createGroupSession = useMutation({
    mutationFn: async (data: FormData) => {
      const token = (await localStorage.getItem("betamindToken")) || ""
      return post_request_with_image('group-sessions/', data, token)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["groupSessions"] })
    },
  })

  return createGroupSession
}

export const useEditGroupSession = (id: string) => {
  const queryClient = useQueryClient()

  const editGroupSession = useMutation({
    mutationFn: async (data: FormData) => {
      const token = (await localStorage.getItem("betamindToken")) || ""
      return put_request_with_image(`group-sessions/${id}/`, data, token)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["groupSessions"] })
    },
  })

  return editGroupSession
}

export const useDeleteGroupSession = (id: string) => {
  const queryClient = useQueryClient()

  const deleteGroupSession = useMutation({
    mutationFn: async () => {
      const token = (await localStorage.getItem("betamindToken")) || ""
      return delete_requests(`group-sessions/${id}/`, token)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["groupSessions"] })
    },
  })

  return deleteGroupSession
}

// ============== Book Mentor Session ============
export const useBookMentorship = () => {
  const queryClient = useQueryClient()

  const bookMentorship = useMutation({
    mutationFn: async (data: any) => {
      const token = (await localStorage.getItem("betamindToken")) || ""
      return post_requests('bookings/', data, token)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookMentorship", "mentorProfile"] })
    },
  })

  return bookMentorship
}



export const useAcceptBooking = (id: any) => {
  const queryClient = useQueryClient()
  const acceptBooking = useMutation({
    mutationFn: async (data: any) => {
      const token = (await localStorage.getItem("betamindToken")) || ""
      console.log("Booking id", id)
      return post_requests(`bookings/${id}/acknowledge/`, data, token)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings", "bookMentorship", "mentorProfile", "individualSessions"] })
    },

  })

  return acceptBooking
}


export const useRejectBooking = (id: any) => {
  const queryClient = useQueryClient()
  const rejectBooking = useMutation({
    mutationFn: async (data: any) => {
      const token = (await localStorage.getItem("betamindToken")) || ""
      return post_requests(`bookings/${id}/decline/`, data, token)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings", "bookMentorship", "mentorProfile", "individualSessions"] })
    },
  })

  return rejectBooking
}


export const useStartGroupSession = (id: any) => {
  const queryClient = useQueryClient()
  const startGroupSession = useMutation({
    mutationFn: async (data: any) => {
      const token = (await localStorage.getItem("betamindToken")) || ""
      return post_requests(`group-sessions/${id}/start/`, data, token)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings", "bookMentorship"] })
    },
  })

  return startGroupSession
}

// /api/v1/group-sessions/{id}/start/


export const useAddBankDetails = () => {
  const queryClient = useQueryClient()

  const addBankDetails = useMutation({
    mutationFn: async (data: any) => {
      const token = (await localStorage.getItem("betamindToken")) || ""
      return post_requests('bank-details/', data, token)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bank"] })
    },
  })

  return addBankDetails
}


export const usePurchaseProducts = () => {
  const queryClient = useQueryClient()

  const purchaseProduct = useMutation({
    mutationFn: async (data: any) => {
      const token = (await localStorage.getItem("betamindToken")) || ""
      return post_requests('purchases/', data, token)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] })
    },
  })

  return purchaseProduct
}

export const useMarkNotificationRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const token = (await localStorage.getItem("betamindToken")) || "";
      return patch_requests(`notifications/${id}/read/`, { is_read: true }, token);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
};


export const useSendEventBlast = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ eventId, subject, message }: { eventId: string; subject: string; message: string }) => {
      const token = (await localStorage.getItem("betamindToken")) || "";
      return post_requests(`event/blasts/${eventId}/`, { subject, message }, token);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

};
