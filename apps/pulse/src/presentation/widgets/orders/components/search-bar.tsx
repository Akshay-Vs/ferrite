'use client';
import { SearchIcon, XIcon } from 'lucide-react';
import { useState } from 'react';
import { Input } from '@/presentation/primitives/input';

const SearchBar = () => {
	const [value, setValue] = useState('');

	const IconProps = {
		className: 'text-foreground text-lg! font-light! cursor-pointer',
	};

	const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setValue(e.target.value);
	};

	const clearValue = () => {
		setValue('');
	};

	return (
		<div className="flex items-center gap-2">
			<Input
				placeholder="Search orders"
				className="placeholder:text-base placeholder:text-foreground/80 placeholder:font-base"
				renderPosition="right"
				render={
					value ? (
						<XIcon {...IconProps} onClick={clearValue} />
					) : (
						<SearchIcon {...IconProps} />
					)
				}
				value={value}
				onChange={handleValueChange}
			/>
		</div>
	);
};

export default SearchBar;
