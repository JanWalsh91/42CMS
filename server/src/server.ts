
import app from "./app";
const PORT = 3000;

app
.init()
.then(() => {
	app.listen(PORT, () => {
		console.log('Express server listening on port ' + PORT);
	})
})

