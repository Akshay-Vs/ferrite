import { ChevronRight, Truck } from 'lucide-react';
import { Button } from '@/presentation/primitives/button';
import KeyValueTable, {
	type Row,
} from '@/presentation/primitives/key-value-table';
import { sheetRouter } from '@/presentation/sheet-router/sheet-router.store';

const address = {
	street: '10 Lake View Park North West',
	city: 'Orlando',
	state: 'Florida',
	country: 'USA',
	landmark: 'Lake Eola',
	zip: '32801',
};
const rows: Row[] = [
	{
		key: 'Tracking Number',
		value: '1819A10DF1AC',
	},
	{
		key: 'Courier',
		value: 'DHL',
	},

	{
		key: 'Address',
		value: `${address.street}, ${address.city}, ${address.state}, ${address.country}`,
	},
	{
		key: 'ETA',
		value: <span className="px-0.5">{new Date().toLocaleDateString()}</span>,
	},
	{
		key: 'Status',
		value: (
			<span className="flex center  rounded-full w-fit px-5 py-1 bg-[#FFD579] text-background gap-2">
				<Truck className="size-4" />
				In Transit
			</span>
		),
	},
];

const ShipmentDetails = () => {
	return (
		<div className="col gap-6">
			<div className="flex-between">
				<p className="text-lg font-light">Shipment Details</p>

				<Button
					unstyled
					tooltip="View More"
					onClick={() =>
						sheetRouter.push('shipment-details', {
							orderId: '1',
						})
					}
				>
					<ChevronRight className="h-6 w-6" />
				</Button>
			</div>

			<div className="col gap-12">
				<div className="rounded-2xl border overflow-hidden">
					<KeyValueTable rows={rows} />
				</div>
			</div>
		</div>
	);
};

export default ShipmentDetails;
