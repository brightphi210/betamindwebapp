import { useQuery } from "@tanstack/react-query";
import { HARD_CODED_INTERESTS } from "../../utils/interest";
import { get_requests } from "../helper/AxioHelper";

import { keepPreviousData } from "@tanstack/react-query";

// Builds "?page=2&page_size=4&..." and skips empty values
const buildQuery = (params: Record<string, any>) => {
    const sp = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") sp.set(key, String(value));
    });
    const qs = sp.toString();
    return qs ? `?${qs}` : "";
};

export const useGetInterests = () => {
    return {
        interests: { data: HARD_CODED_INTERESTS },
        isLoading: false,
        isError: false,
        isFetched: true,
        refetch: async () => ({ data: HARD_CODED_INTERESTS }),
    };
};

export const useGetMyMentorProfile = () => {
    const { data, isLoading, isError, isFetched, refetch } = useQuery({
        queryKey: ["myMentorProfile"],
        queryFn: async () => {
            const token = (await localStorage.getItem("betamindToken")) || "";
            return get_requests("mentors/me/", token);
        },
    });

    return {
        myMentorProfile: data,
        isLoading,
        isError,
        isFetched,
        refetch,
    };
};



export const useGetMyUserProfile = () => {
    const { data, isLoading, isError, isFetched, refetch } = useQuery({
        queryKey: ["myProfile"],
        queryFn: async () => {
            const token = (await localStorage.getItem("betamindToken")) || "";
            return get_requests("profiles/me/", token);
        },
    });

    return {
        myProfile: data,
        isLoading,
        isError,
        isFetched,
        refetch,
    };
};



// ================ MENTORS ======================
// export const useGetMentors = () => {
//     const { data, isLoading, isError, isFetched, refetch } = useQuery({
//         queryKey: ["mentors"],
//         queryFn: async () => {
//             const token = (await localStorage.getItem("betamindToken")) || "";
//             return get_requests("mentors/", token);
//         },
//     });

//     return {
//         mentors: data,
//         isLoading,
//         isError,
//         isFetched,
//         refetch,
//     };
// };

// ================ MENTORS (paginated) ======================
export const useGetMentors = (page = 1, pageSize = 4, extra: Record<string, any> = {}) => {
    const { data, isLoading, isFetching, isError, isFetched, refetch } = useQuery({
        queryKey: ["mentors", page, pageSize, extra],
        queryFn: async () => {
            const token = (await localStorage.getItem("betamindToken")) || "";
            return get_requests(`mentors/${buildQuery({ page, page_size: pageSize, ...extra })}`, token);
        },
        placeholderData: keepPreviousData,
    });

    return { mentors: data, isLoading, isFetching, isError, isFetched, refetch };
};


// =============== GET MENTOR PROFILE ===============
export const useGetMentorProfile = (id: any) => {
    const { data, isLoading, isError, isFetched, refetch } = useQuery({
        queryKey: ["mentorProfile", id],
        queryFn: async () => {
            const token = (await localStorage.getItem("betamindToken")) || "";
            return get_requests(`mentors/${id}/`, token);
        },
        enabled: !!id,
    });

    return {
        aMentor: data,
        isLoading,
        isError,
        isFetched,
        refetch,
    };
};




// ================ EVENTS ======================
export const useGetEvents = () => {
    const { data, isLoading, isError, isFetched, refetch } = useQuery({
        queryKey: ["events"],
        queryFn: async () => {
            const token = (await localStorage.getItem("betamindToken")) || "";
            return get_requests("events/", token);
        },
    });

    return {
        events: data,
        isLoading,
        isError,
        isFetched,
        refetch,
    };
};


export const useGetEventById = (id?: string) => {
    const query = useQuery({
        queryKey: ["event", id],
        enabled: !!id,
        queryFn: async () => {
            const token = localStorage.getItem("betamindToken") || ""
            return get_requests(`events/${id}/`, token)
        },
    })

    return { event: query.data, isLoading: query.isLoading }
}


// ================ EVENTS ======================
export const useGetMineEvents = () => {
    const { data, isLoading, isError, isFetched, refetch } = useQuery({
        queryKey: ["events"],
        queryFn: async () => {
            const token = (await localStorage.getItem("betamindToken")) || "";
            return get_requests("events/mine/", token);
        },
    });

    return {
        mineEvents: data,
        isLoading,
        isError,
        isFetched,
        refetch,
    };
};



// ================== ALL EVENTS =================

// export const useGetAllEvents = () => {
//     const { data, isLoading, isError, isFetched, refetch } = useQuery({
//         queryKey: ["allEvents"],
//         queryFn: async () => {
//             const token = (await localStorage.getItem("betamindToken")) || "";
//             return get_requests("events/", token);
//         },
//     });

//     return {
//         allEvents: data,
//         isLoading,
//         isError,
//         isFetched,
//         refetch,
//     };
// };

// ================== ALL EVENTS (paginated) =================
export const useGetAllEvents = (page = 1, pageSize = 4, extra: Record<string, any> = {}) => {
    const { data, isLoading, isFetching, isError, isFetched, refetch } = useQuery({
        queryKey: ["allEvents", page, pageSize, extra],
        queryFn: async () => {
            const token = (await localStorage.getItem("betamindToken")) || "";
            return get_requests(`events/${buildQuery({ page, page_size: pageSize, ...extra })}`, token);
        },
        placeholderData: keepPreviousData,
    });

    return { allEvents: data, isLoading, isFetching, isError, isFetched, refetch };
};


export const useGetEvent = (id: any) => {
    const { data, isLoading, isError, isFetched, refetch } = useQuery({
        queryKey: ["event", id],
        queryFn: async () => {
            const token = (await localStorage.getItem("betamindToken")) || "";
            return get_requests(`events/${id}/`, token);
        },
        enabled: !!id,
    });

    return {
        eventDetail: data,
        isLoading,
        isError,
        isFetched,
        refetch,
    };
};



// ============= DIGITAL PRODUCT ============
// export const useGetDigitalProduct = () => {
//     const { data, isLoading, isError, isFetched, refetch } = useQuery({
//         queryKey: ["products"],
//         queryFn: async () => {
//             const token = (await localStorage.getItem("betamindToken")) || "";
//             return get_requests(`digital-products/`, token);
//         },
//     });

//     return {
//         digitalProduct: data,
//         isLoading,
//         isError,
//         isFetched,
//         refetch,
//     };
// };

export const useGetDigitalProduct = (page = 1, pageSize = 4, extra: Record<string, any> = {}) => {
    const { data, isLoading, isFetching, isError, isFetched, refetch } = useQuery({
        queryKey: ["products", "list", page, pageSize, extra],
        queryFn: async () => {
            const token = (await localStorage.getItem("betamindToken")) || "";
            return get_requests(`digital-products/${buildQuery({ page, page_size: pageSize, ...extra })}`, token);
        },
        placeholderData: keepPreviousData,
    });

    return { digitalProduct: data, isLoading, isFetching, isError, isFetched, refetch };
};



export const useGetSingleDigitalProduct = (id: any) => {
    const { data, isLoading, isError, isFetched, refetch } = useQuery({
        queryKey: ["digital-product", id],
        queryFn: async () => {
            const token = (await localStorage.getItem("betamindToken")) || "";
            return get_requests(`digital-products/${id}/`, token);
        },
        enabled: !!id,
    });

    return {
        product: data,
        isLoading,
        isError,
        isFetched,
        refetch,
    };
};




// ============== MINE PRODUCT ===============
export const useGetMentorDigitalProduct = () => {
    const { data, isLoading, isError, isFetched, refetch } = useQuery({
        queryKey: ["products"],
        queryFn: async () => {
            const token = (await localStorage.getItem("betamindToken")) || "";
            return get_requests(`digital-products/mine/`, token);
        },
    });

    return {
        digitalProduct: data,
        isLoading,
        isError,
        isFetched,
        refetch,
    };
};


// ============== MINE PRODUCT ===============
export const useGetMentorStatistics = () => {
    const { data, isLoading, isError, isFetched, refetch } = useQuery({
        queryKey: ["statistics"],
        queryFn: async () => {
            const token = (await localStorage.getItem("betamindToken")) || "";
            return get_requests(`mentors/statistics/`, token);
        },
    });

    return {
        mentorStatistics: data,
        isLoading,
        isError,
        isFetched,
        refetch,
    };
};


// ======================= MentorSession ======================
// /api/v1/individual-sessions/
export const useGetMentorIndividualSession = () => {
    const { data, isLoading, isError, isFetched, refetch } = useQuery({
        queryKey: ["individualSessions"],
        queryFn: async () => {
            const token = (await localStorage.getItem("betamindToken")) || "";
            return get_requests(`individual-sessions/`, token);
        },
    });

    return {
        mentorIndividualSession: data,
        isLoading,
        isError,
        isFetched,
        refetch,
    };
};


// ======================= MentorSession ======================

export const useGetUserSession = () => {
    const { data, isLoading, isError, isFetched, refetch } = useQuery({
        queryKey: ["userSession"],
        queryFn: async () => {
            const token = (await localStorage.getItem("betamindToken")) || "";
            return get_requests(`bookings/`, token);
        },
    });

    return {
        userSession: data,
        isLoading,
        isError,
        isFetched,
        refetch,
    };
};

export const useGetMentorGroupSessions = () => {
    const { data, isLoading, isError, isFetched, refetch } = useQuery({
        queryKey: ["groupSessions"],
        queryFn: async () => {
            const token = (await localStorage.getItem("betamindToken")) || "";
            return get_requests(`group-sessions/`, token);
        },
    });

    return {
        mentorGroupSessions: data,
        isLoading,
        isError,
        isFetched,
        refetch,
    };
};



// ============== WALLET =================

export const useGetWallet = () => {
    const { data, isLoading, isError, isFetched, refetch } = useQuery({
        queryKey: ["wallet"],
        queryFn: async () => {
            const token = (await localStorage.getItem("betamindToken")) || "";
            return get_requests(`wallet/`, token);
        },
    });

    return {
        walletData: data,
        isLoading,
        isError,
        isFetched,
        refetch,
    };
};


export const useGetBankDetails = () => {
    const { data, isLoading, isError, isFetched, refetch } = useQuery({
        queryKey: ["bank"],
        queryFn: async () => {
            const token = (await localStorage.getItem("betamindToken")) || "";
            return get_requests(`bank-details/`, token);
        },
    });

    return {
        bankData: data,
        isLoading,
        isError,
        isFetched,
        refetch,
    };
};




// ============== TRANSACTIONS =================

export const useGetTransactions = () => {
    const { data, isLoading, isError, isFetched, refetch } = useQuery({
        queryKey: ["transactions"],
        queryFn: async () => {
            const token = (await localStorage.getItem("betamindToken")) || "";
            return get_requests(`transactions/`, token);
        },
    });

    return {
        transactionsData: data,
        isLoading,
        isError,
        isFetched,
        refetch,
    };
};

// ============== NOTIFICATIONS =================

export const useGetNotifications = () => {
    const { data, isLoading, isError, isFetched, refetch } = useQuery({
        queryKey: ["notifications"],
        queryFn: async () => {
            const token = (await localStorage.getItem("betamindToken")) || "";
            return get_requests(`notifications/`, token);
        },
    });

    return {
        notificationsData: data,
        isLoading,
        isError,
        isFetched,
        refetch,
    };
};

export const useGetNotification = (id?: string) => {
    const { data, isLoading, isError, isFetched, refetch } = useQuery({
        queryKey: ["notification", id],
        queryFn: async () => {
            const token = (await localStorage.getItem("betamindToken")) || "";
            return get_requests(`notifications/${id}/`, token);
        },
        enabled: !!id,
    });

    return {
        notification: data,
        isLoading,
        isError,
        isFetched,
        refetch,
    };
};