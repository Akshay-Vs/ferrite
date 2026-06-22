import { Table, TableBody, TableCell, TableRow } from './table';

export type Row = {
	key: string;
	value: React.ReactNode;
};

const KeyValueTable = ({ rows }: { rows: Row[] }) => {
	return (
		<Table className="table-fixed w-full">
			<TableBody className="w-full">
				{rows.map(({ key: label, value }) => (
					<TableRow
						key={label}
						className="border-y first:border-t-0 last:border-b-0"
					>
						<TableCell
							title={label}
							className="text-start h-16 w-full max-w-2/4 border-r whitespace-nowrap wrap-break-word truncate"
						>
							{label}
						</TableCell>
						<TableCell className="text-start h-16 w-2/3 max-w-0 whitespace-normal wrap-break-word">
							{value}
						</TableCell>
					</TableRow>
				))}
			</TableBody>
		</Table>
	);
};

export default KeyValueTable;
