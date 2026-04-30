import Link from 'next/link';
import { SALES_OVERVIEW } from '@/core/constants/routes.constants';
import GradientText from '@/presentation/primitives/gradient-text';

const NotFoundPage = () => {
	return (
		<div className="max-h-screen max-w-screen h-dvh w-dvw col-center gap-6">
			<h1 className="text-[20rem] font-thin text-center flex select-none">
				<GradientText text="40" />
				<div className="rotate-8 translate-y-12">
					<GradientText text="4" />
				</div>
			</h1>

			<p className="text-center text-2xl font-light">
				The page you are looking for does not exist.
			</p>

			<Link href={SALES_OVERVIEW} className="mt-5 underline underline-offset-2">
				Go Home
			</Link>
		</div>
	);
};

export default NotFoundPage;
