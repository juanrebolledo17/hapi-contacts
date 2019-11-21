const Hapi = require('hapi')
const Path = require('path')
const Inert = require('inert')

const Pusher = require('pusher')
const pusher = new Pusher({
	appId: '',
	key: '',
	secret: '',
	cluster: '',
	encrypted: true,
})

const server = Hapi.server({
	port: process.env.port || 4000,
	host: 'localhost',
	routes: {
		files: {
			relativeTo: Path.join(__dirname, 'public')
		}
	}
})

const init = async () => {
	await server.register(Inert)

	server.route({
		method: 'GET',
		path: '/',
		handler: {
			file: 'index.html'
		}
	})

	server.route({
		method: 'POST',
		path: '/contact',
		handler(request, h) {
			const { contact } = JSON.parse(request.payload)
			const randomNumber = Math.floor(Math.random() * 100)
			const genders = ['men', 'women']
			const randomGender = genders[Math.floor(Math.random() * genders.length)]
			Object.assing(contact, {
				id: `contact-${Date.now()}`,
				image: `https://randomuser.me/api/portraits/${randomGender}/${randomNumber}.jpg`
			})
			pusher.trigger('contact', 'contact-added', { contact })
			return contact
		}
	})

	server.route({
		method: 'DELETE',
		path: 'contact/{id}',
		handler(request, h) {
			const { id } = request.params
			pusher.trigger('contact', 'contact-deleted', { id })
			return id
		}
	})

	await server.start()
	console.log(`Server running oat port: ${server.info.uri}`)
}

process.on('unhandledRejection', error => {
	console.log(error)
	process.exit(1)
})

init()