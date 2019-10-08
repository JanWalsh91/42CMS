import * as xlmbuilder from 'xmlbuilder'


let xml = {
	sites: {
		site: [{
			'#text': 'hello1',
			'@site-id': 'id1',
		}, {
			'#text': 'hello2',
			'@site-id': 'id2',
		}],
	}
}

console.log(xlmbuilder.create(xml).end({pretty: true}).toString())

