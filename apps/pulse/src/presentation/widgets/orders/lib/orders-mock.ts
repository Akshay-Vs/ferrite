export type Product = {
	id: string;
	name: string;
	price: number;
	image: string;
};

export type Order = {
	id: string;
	date: Date;
	user: {
		id: string;
		name: string;
		email: string;
		avatar: string;
	};
	products: Product[];
	address: {
		street: string;
		city: string;
		state: string;
		country: string;
		landmark: string;
		zip: string;
	};
	transactionStatus: 'success' | 'failed' | 'pending';
	transactionMethod: 'card' | 'bankTransfer' | 'cash' | 'UPI';
	status: 'delivered' | 'inTransit' | 'processing' | 'returned' | 'cancelled';
};

export const orders: Order[] = [
	{
		id: 'ORD-1001',
		date: new Date('2026-05-12'),
		user: {
			id: 'USR-001',
			name: 'Sophia Johnson',
			email: 'sophia.johnson@example.com',
			avatar: 'https://i.pravatar.cc/150?img=1',
		},
		products: [
			{
				id: '1',
				name: 'Velvet Matte Lipstick With Glitter',
				price: 12.99,
				image:
					'https://images.pexels.com/photos/7797527/pexels-photo-7797527.jpeg',
			},
		],
		address: {
			street: '42 Maple Street',
			city: 'Austin',
			state: 'Texas',
			country: 'USA',
			landmark: 'Near Central Library',
			zip: '78701',
		},
		transactionStatus: 'success',
		transactionMethod: 'card',
		status: 'delivered',
	},
	{
		id: 'ORD-1002',
		date: new Date('2026-05-15'),
		user: {
			id: 'USR-002',
			name: 'Emma Wilson',
			email: 'emma.wilson@example.com',
			avatar: 'https://i.pravatar.cc/150?img=2',
		},
		products: [
			{
				id: '2',
				name: 'Evergreen Aloe Face Gel',
				price: 9.99,
				image:
					'https://images.pexels.com/photos/8140898/pexels-photo-8140898.jpeg',
			},
		],
		address: {
			street: '12 Sunset Avenue',
			city: 'Seattle',
			state: 'Washington',
			country: 'USA',
			landmark: 'Opposite Green Mall',
			zip: '98101',
		},
		transactionStatus: 'pending',
		transactionMethod: 'UPI',
		status: 'processing',
	},
	{
		id: 'ORD-1003',
		date: new Date('2026-05-18'),
		user: {
			id: 'USR-003',
			name: 'Olivia Brown',
			email: 'olivia.brown@example.com',
			avatar: 'https://i.pravatar.cc/150?img=31',
		},
		products: [
			{
				id: '3',
				name: 'Circuit Glow Highlighter',
				price: 9.99,
				image:
					'https://images.pexels.com/photos/7795688/pexels-photo-7795688.jpeg',
			},
			{
				id: '4',
				name: 'Urban Hydrating Mist',
				price: 9.99,
				image:
					'https://images.pexels.com/photos/7795846/pexels-photo-7795846.jpeg',
			},
		],
		address: {
			street: '89 River Road',
			city: 'Denver',
			state: 'Colorado',
			country: 'USA',
			landmark: 'Near City Park',
			zip: '80202',
		},
		transactionStatus: 'success',
		transactionMethod: 'card',
		status: 'inTransit',
	},
	{
		id: 'ORD-1004',
		date: new Date('2026-05-20'),
		user: {
			id: 'USR-004',
			name: 'Ava Martinez',
			email: 'ava.martinez@example.com',
			avatar: 'https://i.pravatar.cc/150?img=16',
		},
		products: [
			{
				id: '5',
				name: 'Midnight Muse Perfume',
				price: 9.99,
				image:
					'https://images.pexels.com/photos/36833967/pexels-photo-36833967.jpeg',
			},
		],
		address: {
			street: '210 Oak Drive',
			city: 'Miami',
			state: 'Florida',
			country: 'USA',
			landmark: 'Palm Grove',
			zip: '33101',
		},
		transactionStatus: 'failed',
		transactionMethod: 'bankTransfer',
		status: 'cancelled',
	},
	{
		id: 'ORD-1005',
		date: new Date('2026-05-22'),
		user: {
			id: 'USR-005',
			name: 'Mia Davis',
			email: 'mia.davis@example.com',
			avatar: 'https://i.pravatar.cc/150?img=5',
		},
		products: [
			{
				id: '6',
				name: 'Petal Rose Facial Serum',
				price: 9.99,
				image:
					'https://images.pexels.com/photos/10825663/pexels-photo-10825663.jpeg',
			},
			{
				id: '1',
				name: 'Velvet Matte Lipstick',
				price: 12.99,
				image:
					'https://images.pexels.com/photos/7797527/pexels-photo-7797527.jpeg',
			},
		],
		address: {
			street: '18 Cherry Lane',
			city: 'Chicago',
			state: 'Illinois',
			country: 'USA',
			landmark: 'Union Square',
			zip: '60601',
		},
		transactionStatus: 'success',
		transactionMethod: 'cash',
		status: 'delivered',
	},
	{
		id: 'ORD-1006',
		date: new Date('2026-05-25'),
		user: {
			id: 'USR-006',
			name: 'Charlotte Taylor',
			email: 'charlotte.taylor@example.com',
			avatar: 'https://i.pravatar.cc/150?img=6',
		},
		products: [
			{
				id: '4',
				name: 'Urban Hydrating Mist',
				price: 9.99,
				image:
					'https://images.pexels.com/photos/7795846/pexels-photo-7795846.jpeg',
			},
		],
		address: {
			street: '54 Hill Street',
			city: 'Boston',
			state: 'Massachusetts',
			country: 'USA',
			landmark: 'Near Metro Station',
			zip: '02108',
		},
		transactionStatus: 'success',
		transactionMethod: 'UPI',
		status: 'returned',
	},
	{
		id: 'ORD-1007',
		date: new Date('2026-05-27'),
		user: {
			id: 'USR-007',
			name: 'Amelia Anderson',
			email: 'amelia.anderson@example.com',
			avatar: 'https://i.pravatar.cc/150?img=7',
		},
		products: [
			{
				id: '2',
				name: 'Evergreen Aloe Face Gel',
				price: 9.99,
				image:
					'https://images.pexels.com/photos/8140898/pexels-photo-8140898.jpeg',
			},
			{
				id: '6',
				name: 'Petal Rose Facial Serum',
				price: 9.99,
				image:
					'https://images.pexels.com/photos/10825663/pexels-photo-10825663.jpeg',
			},
		],
		address: {
			street: '76 Garden Street',
			city: 'Portland',
			state: 'Oregon',
			country: 'USA',
			landmark: 'Rose Garden',
			zip: '97201',
		},
		transactionStatus: 'success',
		transactionMethod: 'card',
		status: 'inTransit',
	},
	{
		id: 'ORD-1008',
		date: new Date('2026-05-30'),
		user: {
			id: 'USR-008',
			name: 'Harper Thomas',
			email: 'harper.thomas@example.com',
			avatar: 'https://i.pravatar.cc/150?img=11',
		},
		products: [
			{
				id: '3',
				name: 'Circuit Glow Highlighter',
				price: 9.99,
				image:
					'https://images.pexels.com/photos/7795688/pexels-photo-7795688.jpeg',
			},
			{
				id: '32',
				name: 'Circuit Glow Highlighter',
				price: 9.99,
				image:
					'https://images.pexels.com/photos/7795688/pexels-photo-7795688.jpeg',
			},
			{
				id: '37',
				name: 'Circuit Glow Highlighter',
				price: 9.99,
				image:
					'https://images.pexels.com/photos/7795688/pexels-photo-7795688.jpeg',
			},
			{
				id: '31',
				name: 'Circuit Glow Highlighter',
				price: 9.99,
				image:
					'https://images.pexels.com/photos/7795688/pexels-photo-7795688.jpeg',
			},
			{
				id: '13',
				name: 'Circuit Glow Highlighter',
				price: 9.99,
				image:
					'https://images.pexels.com/photos/7795688/pexels-photo-7795688.jpeg',
			},
		],
		address: {
			street: '99 Ocean Boulevard',
			city: 'San Diego',
			state: 'California',
			country: 'USA',
			landmark: 'Harbor Point',
			zip: '92101',
		},
		transactionStatus: 'pending',
		transactionMethod: 'bankTransfer',
		status: 'processing',
	},
	{
		id: 'ORD-1009',
		date: new Date('2026-06-01'),
		user: {
			id: 'USR-009',
			name: 'Evelyn Moore',
			email: 'evelyn.moore@example.com',
			avatar: 'https://i.pravatar.cc/150?img=9',
		},
		products: [
			{
				id: '5',
				name: 'Midnight Muse Perfume',
				price: 9.99,
				image:
					'https://images.pexels.com/photos/36833967/pexels-photo-36833967.jpeg',
			},
			{
				id: '1',
				name: 'Velvet Matte Lipstick',
				price: 12.99,
				image:
					'https://images.pexels.com/photos/7797527/pexels-photo-7797527.jpeg',
			},
			{
				id: '4',
				name: 'Urban Hydrating Mist',
				price: 9.99,
				image:
					'https://images.pexels.com/photos/7795846/pexels-photo-7795846.jpeg',
			},
		],
		address: {
			street: '145 Birch Street',
			city: 'Phoenix',
			state: 'Arizona',
			country: 'USA',
			landmark: 'Downtown Plaza',
			zip: '85001',
		},
		transactionStatus: 'success',
		transactionMethod: 'card',
		status: 'delivered',
	},
	{
		id: 'ORD-1010',
		date: new Date('2026-06-04'),
		user: {
			id: 'USR-010',
			name: 'Isabella White',
			email: 'isabella.white@example.com',
			avatar: 'https://i.pravatar.cc/150?img=10',
		},
		products: [
			{
				id: '6',
				name: 'Petal Rose Facial Serum',
				price: 9.99,
				image:
					'https://images.pexels.com/photos/10825663/pexels-photo-10825663.jpeg',
			},
		],
		address: {
			street: '67 Magnolia Drive',
			city: 'Nashville',
			state: 'Tennessee',
			country: 'USA',
			landmark: 'Music Square',
			zip: '37201',
		},
		transactionStatus: 'success',
		transactionMethod: 'UPI',
		status: 'delivered',
	},
];
