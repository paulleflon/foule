import axios, { AxiosRequestConfig } from 'axios';

export async function get(endpoint: string, params?: AxiosRequestConfig<any>) {
	return await axios.get(`${process.env.REACT_APP_API}${endpoint}`, {
		'headers': {
			'Authorization': process.env.REACT_APP_API_KEY!
		},
		...params
	});
}

export async function post(endpoint: string, data?: Record<string, any>, params?: AxiosRequestConfig<any>) {
	return await axios.post(`${process.env.REACT_APP_API}${endpoint}`, data, {
		'headers': {
			'Authorization': process.env.REACT_APP_API_KEY!
		},
		...params
	});
}