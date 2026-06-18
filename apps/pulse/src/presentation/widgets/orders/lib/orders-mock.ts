export type Product = {
	id: string;
	name: string;
	price: number;
	image: string;
};

export type OrderStatus =
	| 'delivered'
	| 'inTransit'
	| 'processing'
	| 'returned'
	| 'cancelled';
export type TransactionStatus = 'success' | 'failed' | 'pending';
export type TransactionMethod = 'card' | 'bankTransfer' | 'cash' | 'UPI';

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
	transactionStatus: TransactionStatus;
	transactionMethod: TransactionMethod;
	status: OrderStatus;
};

export const orders: Order[] = [
	{
		id: 'ORD-1011',
		date: new Date('2026-06-05'),
		user: {
			id: 'USR-011',
			name: 'Liam Harris',
			email: 'liam.harris@example.com',
			avatar: 'https://i.pravatar.cc/150?img=12',
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
			street: '221 Pine Street',
			city: 'Dallas',
			state: 'Texas',
			country: 'USA',
			landmark: 'City Hall',
			zip: '75201',
		},
		transactionStatus: 'success',
		transactionMethod: 'card',
		status: 'delivered',
	},
	{
		id: 'ORD-1012',
		date: new Date('2026-06-06'),
		user: {
			id: 'USR-012',
			name: 'Noah Walker',
			email: 'noah.walker@example.com',
			avatar: 'https://i.pravatar.cc/150?img=13',
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
			street: '14 Cedar Avenue',
			city: 'Atlanta',
			state: 'Georgia',
			country: 'USA',
			landmark: 'Peachtree Center',
			zip: '30303',
		},
		transactionStatus: 'pending',
		transactionMethod: 'bankTransfer',
		status: 'processing',
	},
	{
		id: 'ORD-1013',
		date: new Date('2026-06-07'),
		user: {
			id: 'USR-013',
			name: 'James Young',
			email: 'james.young@example.com',
			avatar: 'https://i.pravatar.cc/150?img=14',
		},
		products: [
			{
				id: '1',
				name: 'Velvet Matte Lipstick',
				price: 12.99,
				image:
					'https://images.pexels.com/photos/7797527/pexels-photo-7797527.jpeg',
			},
			{
				id: '3',
				name: 'Circuit Glow Highlighter',
				price: 9.99,
				image:
					'https://images.pexels.com/photos/7795688/pexels-photo-7795688.jpeg',
			},
		],
		address: {
			street: '88 King Street',
			city: 'Charlotte',
			state: 'North Carolina',
			country: 'USA',
			landmark: 'Freedom Park',
			zip: '28202',
		},
		transactionStatus: 'success',
		transactionMethod: 'UPI',
		status: 'inTransit',
	},
	{
		id: 'ORD-1014',
		date: new Date('2026-06-08'),
		user: {
			id: 'USR-014',
			name: 'Benjamin Hall',
			email: 'benjamin.hall@example.com',
			avatar: 'https://i.pravatar.cc/150?img=15',
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
			street: '72 Elm Street',
			city: 'Detroit',
			state: 'Michigan',
			country: 'USA',
			landmark: 'Riverfront',
			zip: '48201',
		},
		transactionStatus: 'failed',
		transactionMethod: 'card',
		status: 'cancelled',
	},
	{
		id: 'ORD-1015',
		date: new Date('2026-06-09'),
		user: {
			id: 'USR-015',
			name: 'Lucas King',
			email: 'lucas.king@example.com',
			avatar: 'https://i.pravatar.cc/150?img=17',
		},
		products: [
			{
				id: '4',
				name: 'Urban Hydrating Mist',
				price: 9.99,
				image:
					'https://images.pexels.com/photos/7795846/pexels-photo-7795846.jpeg',
			},
			{
				id: '5',
				name: 'Midnight Muse Perfume',
				price: 9.99,
				image:
					'https://images.pexels.com/photos/36833967/pexels-photo-36833967.jpeg',
			},
		],
		address: {
			street: '34 Aspen Road',
			city: 'Salt Lake City',
			state: 'Utah',
			country: 'USA',
			landmark: 'Temple Square',
			zip: '84101',
		},
		transactionStatus: 'success',
		transactionMethod: 'cash',
		status: 'delivered',
	},
	{
		id: 'ORD-1016',
		date: new Date('2026-06-10'),
		user: {
			id: 'USR-016',
			name: 'Henry Scott',
			email: 'henry.scott@example.com',
			avatar: 'https://i.pravatar.cc/150?img=18',
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
			street: '56 Willow Drive',
			city: 'Las Vegas',
			state: 'Nevada',
			country: 'USA',
			landmark: 'The Strip',
			zip: '89101',
		},
		transactionStatus: 'success',
		transactionMethod: 'card',
		status: 'returned',
	},
	{
		id: 'ORD-1017',
		date: new Date('2026-06-11'),
		user: {
			id: 'USR-017',
			name: 'Alexander Green',
			email: 'alexander.green@example.com',
			avatar: 'https://i.pravatar.cc/150?img=19',
		},
		products: [
			{
				id: '3',
				name: 'Circuit Glow Highlighter',
				price: 9.99,
				image:
					'https://images.pexels.com/photos/7795688/pexels-photo-7795688.jpeg',
			},
		],
		address: {
			street: '91 Birch Avenue',
			city: 'Minneapolis',
			state: 'Minnesota',
			country: 'USA',
			landmark: 'Stone Arch Bridge',
			zip: '55401',
		},
		transactionStatus: 'pending',
		transactionMethod: 'UPI',
		status: 'processing',
	},
	{
		id: 'ORD-1018',
		date: new Date('2026-06-12'),
		user: {
			id: 'USR-018',
			name: 'Michael Adams',
			email: 'michael.adams@example.com',
			avatar: 'https://i.pravatar.cc/150?img=20',
		},
		products: [
			{
				id: '1',
				name: 'Velvet Matte Lipstick',
				price: 12.99,
				image:
					'https://images.pexels.com/photos/7797527/pexels-photo-7797527.jpeg',
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
			street: '10 Lake View',
			city: 'Orlando',
			state: 'Florida',
			country: 'USA',
			landmark: 'Lake Eola',
			zip: '32801',
		},
		transactionStatus: 'success',
		transactionMethod: 'card',
		status: 'inTransit',
	},
	{
		id: 'ORD-1019',
		date: new Date('2026-06-13'),
		user: {
			id: 'USR-019',
			name: 'Daniel Baker',
			email: 'daniel.baker@example.com',
			avatar: 'https://i.pravatar.cc/150?img=21',
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
			street: '62 Harbor Street',
			city: 'Tampa',
			state: 'Florida',
			country: 'USA',
			landmark: 'Harbor Bay',
			zip: '33602',
		},
		transactionStatus: 'success',
		transactionMethod: 'bankTransfer',
		status: 'delivered',
	},
	{
		id: 'ORD-1020',
		date: new Date('2026-06-14'),
		user: {
			id: 'USR-020',
			name: 'Matthew Nelson',
			email: 'matthew.nelson@example.com',
			avatar: 'https://i.pravatar.cc/150?img=22',
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
			street: '19 Valley Road',
			city: 'Raleigh',
			state: 'North Carolina',
			country: 'USA',
			landmark: 'Research Triangle',
			zip: '27601',
		},
		transactionStatus: 'failed',
		transactionMethod: 'card',
		status: 'cancelled',
	},

	// ORD-1021 to ORD-1030 follow same pattern

	{
		id: 'ORD-1021',
		date: new Date('2026-06-15'),
		user: {
			id: 'USR-021',
			name: 'David Carter',
			email: 'david.carter@example.com',
			avatar: 'https://i.pravatar.cc/150?img=23',
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
			street: '42 Brook Lane',
			city: 'Kansas City',
			state: 'Missouri',
			country: 'USA',
			landmark: 'Union Station',
			zip: '64106',
		},
		transactionStatus: 'success',
		transactionMethod: 'cash',
		status: 'delivered',
	},
	{
		id: 'ORD-1022',
		date: new Date('2026-06-16'),
		user: {
			id: 'USR-022',
			name: 'Joseph Mitchell',
			email: 'joseph.mitchell@example.com',
			avatar: 'https://i.pravatar.cc/150?img=24',
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
			street: '11 Forest Drive',
			city: 'Columbus',
			state: 'Ohio',
			country: 'USA',
			landmark: 'State Capitol',
			zip: '43215',
		},
		transactionStatus: 'pending',
		transactionMethod: 'UPI',
		status: 'processing',
	},
	{
		id: 'ORD-1023',
		date: new Date('2026-06-17'),
		user: {
			id: 'USR-023',
			name: 'Samuel Perez',
			email: 'samuel.perez@example.com',
			avatar: 'https://i.pravatar.cc/150?img=25',
		},
		products: [
			{
				id: '3',
				name: 'Circuit Glow Highlighter',
				price: 9.99,
				image:
					'https://images.pexels.com/photos/7795688/pexels-photo-7795688.jpeg',
			},
		],
		address: {
			street: '87 Oak Street',
			city: 'Indianapolis',
			state: 'Indiana',
			country: 'USA',
			landmark: 'Monument Circle',
			zip: '46204',
		},
		transactionStatus: 'success',
		transactionMethod: 'card',
		status: 'inTransit',
	},
	{
		id: 'ORD-1024',
		date: new Date('2026-06-18'),
		user: {
			id: 'USR-024',
			name: 'John Roberts',
			email: 'john.roberts@example.com',
			avatar: 'https://i.pravatar.cc/150?img=26',
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
			street: '45 River Lane',
			city: 'Richmond',
			state: 'Virginia',
			country: 'USA',
			landmark: 'Canal Walk',
			zip: '23219',
		},
		transactionStatus: 'success',
		transactionMethod: 'bankTransfer',
		status: 'delivered',
	},
	{
		id: 'ORD-1025',
		date: new Date('2026-06-19'),
		user: {
			id: 'USR-025',
			name: 'Andrew Phillips',
			email: 'andrew.phillips@example.com',
			avatar: 'https://i.pravatar.cc/150?img=27',
		},
		products: [
			{
				id: '1',
				name: 'Velvet Matte Lipstick',
				price: 12.99,
				image:
					'https://images.pexels.com/photos/7797527/pexels-photo-7797527.jpeg',
			},
		],
		address: {
			street: '73 Cedar Court',
			city: 'Milwaukee',
			state: 'Wisconsin',
			country: 'USA',
			landmark: 'RiverWalk',
			zip: '53202',
		},
		transactionStatus: 'success',
		transactionMethod: 'card',
		status: 'returned',
	},
	{
		id: 'ORD-1026',
		date: new Date('2026-06-20'),
		user: {
			id: 'USR-026',
			name: 'Christopher Evans',
			email: 'christopher.evans@example.com',
			avatar: 'https://i.pravatar.cc/150?img=28',
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
			street: '90 Lake Drive',
			city: 'Omaha',
			state: 'Nebraska',
			country: 'USA',
			landmark: 'Old Market',
			zip: '68102',
		},
		transactionStatus: 'failed',
		transactionMethod: 'card',
		status: 'cancelled',
	},
	{
		id: 'ORD-1027',
		date: new Date('2026-06-21'),
		user: {
			id: 'USR-027',
			name: 'Joshua Turner',
			email: 'joshua.turner@example.com',
			avatar: 'https://i.pravatar.cc/150?img=29',
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
			street: '37 Maple Avenue',
			city: 'Boise',
			state: 'Idaho',
			country: 'USA',
			landmark: 'Capitol Park',
			zip: '83702',
		},
		transactionStatus: 'success',
		transactionMethod: 'cash',
		status: 'delivered',
	},
	{
		id: 'ORD-1028',
		date: new Date('2026-06-22'),
		user: {
			id: 'USR-028',
			name: 'Ryan Parker',
			email: 'ryan.parker@example.com',
			avatar: 'https://i.pravatar.cc/150?img=30',
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
			street: '58 Sunset Blvd',
			city: 'Albuquerque',
			state: 'New Mexico',
			country: 'USA',
			landmark: 'Old Town',
			zip: '87102',
		},
		transactionStatus: 'pending',
		transactionMethod: 'UPI',
		status: 'processing',
	},
	{
		id: 'ORD-1029',
		date: new Date('2026-06-23'),
		user: {
			id: 'USR-029',
			name: 'Nathan Collins',
			email: 'nathan.collins@example.com',
			avatar: 'https://i.pravatar.cc/150?img=32',
		},
		products: [
			{
				id: '3',
				name: 'Circuit Glow Highlighter',
				price: 9.99,
				image:
					'https://images.pexels.com/photos/7795688/pexels-photo-7795688.jpeg',
			},
		],
		address: {
			street: '17 Park Street',
			city: 'Louisville',
			state: 'Kentucky',
			country: 'USA',
			landmark: 'Waterfront Park',
			zip: '40202',
		},
		transactionStatus: 'success',
		transactionMethod: 'card',
		status: 'inTransit',
	},
	{
		id: 'ORD-1030',
		date: new Date('2026-06-24'),
		user: {
			id: 'USR-030',
			name: 'Aaron Murphy',
			email: 'aaron.murphy@example.com',
			avatar: 'https://i.pravatar.cc/150?img=33',
		},
		products: [
			{
				id: '1',
				name: 'Velvet Matte Lipstick',
				price: 12.99,
				image:
					'https://images.pexels.com/photos/7797527/pexels-photo-7797527.jpeg',
			},
			{
				id: '5',
				name: 'Midnight Muse Perfume',
				price: 9.99,
				image:
					'https://images.pexels.com/photos/36833967/pexels-photo-36833967.jpeg',
			},
		],
		address: {
			street: '120 Main Street',
			city: 'Birmingham',
			state: 'Alabama',
			country: 'USA',
			landmark: 'Railroad Park',
			zip: '35203',
		},
		transactionStatus: 'success',
		transactionMethod: 'card',
		status: 'delivered',
	},
];
