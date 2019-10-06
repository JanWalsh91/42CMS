import * as xlmbuilder from 'xmlbuilder'


let xml = {
	catalog: 'hello',
	test2: {
		stuff: 'helo1'
	}
}

console.log(xlmbuilder.create(xml).end({pretty: true}).toString())

