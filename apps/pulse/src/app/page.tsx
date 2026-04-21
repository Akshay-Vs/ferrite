import { redirect } from 'next/navigation';
import { OVERVIEW } from '@/core/constants/routes.constants';

const rootPage = () => {
	return redirect(OVERVIEW);
};

export default rootPage;
