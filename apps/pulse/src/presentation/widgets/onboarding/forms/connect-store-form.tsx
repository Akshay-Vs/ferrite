'use client';

import { useRouter } from 'nextjs-toploader/app';
import { SALES_OVERVIEW } from '@/core/constants/routes.constants';
import { Button } from '@/presentation/primitives/button';

const ConnectStoreForm = () => {
	const { push } = useRouter();

	return (
		<Button
			type="submit"
			variant="secondary"
			className="w-full"
			onClick={() => push(SALES_OVERVIEW)}
		>
			Go to dashboard
		</Button>
	);
};

export default ConnectStoreForm;
