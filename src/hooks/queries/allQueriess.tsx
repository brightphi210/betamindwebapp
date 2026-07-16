import { useQuery } from "@tanstack/react-query";
import { get_requests } from "../helper/AxioHelper";


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