import { useGetMyProfile } from '@ferrite/react/hooks/use-platform-user';

export const useUser = () => {
	const { data, isPending } = useGetMyProfile();

	return {
		data,
		isPending,
		fullName: data
			? `${data.firstName ?? ''} ${data.lastName ?? ''}`.trim()
			: '',
	};
};
