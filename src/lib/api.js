export function query(path, method, body) {
	return fetch(path, {
		method,
		body: JSON.stringify(body),
		headers: {
			'Content-Type': 'application/json'
		}
	});
}

export function get(path, body) {
	return query(path, 'GET', body);
}

export function post(path, body) {
	return query(path, 'POST', body);
}
