import User from './src/models/user';

(async () => {
	User.create({firstName: 'j', lastName: 'w'}, (err, user) => {
		console.log('err', err)
		console.log('user', user)
	})
	// console.log(ret)
	// ret = await User.remove({});
	// console.log(ret)
})()