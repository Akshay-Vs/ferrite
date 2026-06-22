import { ChevronRight } from 'lucide-react';
import { Button } from '@/presentation/primitives/button';
import KeyValueTable, {
	type Row,
} from '@/presentation/primitives/key-value-table';
import { sheetRouter } from '@/presentation/sheet-router/sheet-router.store';
import type { TransactionStatus } from '../lib/orders-mock';
import { TransactionStatusLabel } from './transaction-status';

const transaction = {
	id: 'TXN-1018',
	method: 'Credit Card',
	date: '2026-06-12',
	amount: '$12.99',
	status: 'success' as TransactionStatus,
};

const rows: Row[] = [
	{
		key: 'Transaction ID',
		value: transaction.id,
	},
	{
		key: 'Payment Method',
		value: transaction.method,
	},
	{
		key: 'Payment Date',
		value: transaction.date,
	},
	{
		key: 'Payment Amount',
		value: transaction.amount,
	},
	{
		key: 'Payment Status',
		value: <TransactionStatusLabel status={transaction.status} />,
	},
];

const PaymentDetails = () => {
	return (
		<div className="col gap-4">
			<div className="flex-between">
				<p className="text-lg font-light">Payment Details</p>

				<Button
					unstyled
					tooltip="View More"
					onClick={() =>
						sheetRouter.push('payment-details', {
							transactionId: transaction.id,
						})
					}
				>
					<ChevronRight className="h-6 w-6" />
				</Button>
			</div>

			<div className="rounded-2xl border overflow-hidden">
				<KeyValueTable rows={rows} />
			</div>
		</div>
	);
};

export default PaymentDetails;
