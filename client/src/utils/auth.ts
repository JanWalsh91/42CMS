import api from './api';

export const isAuth = async () => {
	let res = await api.get('/auth')
	return (res.status == 200);
}