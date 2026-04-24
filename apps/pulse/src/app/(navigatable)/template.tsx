import type { PropsWithChildren } from 'react';
import FadeInContainer from '@/presentation/animations/fade-in-container';

const template = ({ children }: PropsWithChildren) => {
	return <FadeInContainer>{children}</FadeInContainer>;
};
export default template;
