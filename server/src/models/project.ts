import * as mongoose from 'mongoose';
const Schema = mongoose.Schema;

class Project {

}

const ProjectSchema = new Schema({
	name: {
		type: String,
		required: true
	},
	owner: {
		type: Schema.Types.ObjectId,
		ref: 'User',
		required: true
	}
}).loadClass(Project)	

export default mongoose.model('Project', ProjectSchema);