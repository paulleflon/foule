import axios from 'axios';

export async function get(endpoint, params) {
	return await axios.get(`${process.env.REACT_APP_API}${endpoint}`, {
		'headers': {
			'Authorization': process.env.REACT_APP_API_KEY
		},
		...params
	});
}

export async function post(endpoint, data, params) {
	return await axios.post(`${process.env.REACT_APP_API}${endpoint}`, data, {
		'headers': {
			'Authorization': process.env.REACT_APP_API_KEY
		},
		...params
	});
}