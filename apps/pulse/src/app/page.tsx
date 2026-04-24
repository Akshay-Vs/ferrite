import { redirect } from 'next/navigation';
import { SALES_OVERVIEW } from '@/core/constants/routes.constants';

const rootPage = () => {
	return redirect(SALES_OVERVIEW);
};

export default rootPage;
