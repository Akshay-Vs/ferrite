import FadeInItem from '../animations/fade-in-item';
import GradientText from './gradient-text';

interface FormHeadingProps {
	title: string;
	highlightedText: string;
	description: string;
}

const FormHeading = ({
	title,
	highlightedText,
	description,
}: FormHeadingProps) => {
	return (
		<FadeInItem className="col-center gap-4">
			<h1 className="text-4xl font-extralight tracking-[0.012rem]">
				{title} <GradientText text={highlightedText} className="font-light" />
			</h1>
			<p className="text-lg font-light text-center">{description}</p>
		</FadeInItem>
	);
};

export default FormHeading;
