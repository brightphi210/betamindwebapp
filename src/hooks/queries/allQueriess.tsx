import { useQuery } from "@tanstack/react-query";
import { get_requests } from "../helper/AxioHelper";




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
export const useGetMentors = () => {
    const { data, isLoading, isError, isFetched, refetch } = useQuery({
        queryKey: ["mentors"],
        queryFn: async () => {
            const token = (await localStorage.getItem("betamindToken")) || "";
            return get_requests("mentors/", token);
        },
    });

    return {
        mentors: data,
        isLoading,
        isError,
        isFetched,
        refetch,
    };
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

export const useGetAllEvents = () => {
    const { data, isLoading, isError, isFetched, refetch } = useQuery({
        queryKey: ["allEvents"],
        queryFn: async () => {
            const token = (await localStorage.getItem("betamindToken")) || "";
            return get_requests("events/", token);
        },
    });

    return {
        allEvents: data,
        isLoading,
        isError,
        isFetched,
        refetch,
    };
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
export const useGetDigitalProduct = () => {
    const { data, isLoading, isError, isFetched, refetch } = useQuery({
        queryKey: ["products"],
        queryFn: async () => {
            const token = (await localStorage.getItem("betamindToken")) || "";
            return get_requests(`digital-products/`, token);
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



export const useGetSingleDigitalProduct = (id: any) => {
    const { data, isLoading, isError, isFetched, refetch } = useQuery({
        queryKey: ["event", id],
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