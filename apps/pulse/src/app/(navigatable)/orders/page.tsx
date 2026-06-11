import FadeInItem from '@/presentation/animations/fade-in-item';
import AddNewOrder from '@/presentation/widgets/orders/components/add-new-order';
import OrdersStatusChart from '@/presentation/widgets/orders/components/orders-status-chart';
import OrdersTable from '@/presentation/widgets/orders/tables/orders-table';
import TableHeaderControlls from '@/presentation/widgets/orders/tables/table-header-controlls';

const ordersPage = () => {
	return (
		<div className="w-full flex flex-col gap-6">
			<div className="w-full flex justify-between items-center">
				<FadeInItem className="flex gap-4">
					<AddNewOrder />
					<TableHeaderControlls />
				</FadeInItem>

				<FadeInItem>
					<OrdersStatusChart
						data={{
							cancelled: 20,
							delivered: 200,
							inTransit: 100,
							processing: 100,
							returned: 10,
						}}
					/>
				</FadeInItem>
			</div>

			<FadeInItem>
				<OrdersTable />
			</FadeInItem>
		</div>
	);
};

export default ordersPage;
