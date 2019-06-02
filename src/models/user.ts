import * as mongoose from 'mongoose';
const Schema = mongoose.Schema;

// https://mongoosejs.com/docs/advanced_schemas.html
class User {

}

const UserSchema = new Schema({
	firstName: {
        type: String,
        required: 'Enter a first name'
    },
    lastName: {
        type: String,
        required: 'Enter a last name'
    },
    email: {
        type: String            
    },
    company: {
        type: String            
    },
    created_date: {
        type: Date,
        default: Date.now
	},
	projects: [{
		type: Schema.Types.ObjectId,
		ref: 'Project'
	}]
}).loadClass(User)	

export default mongoose.model('User', UserSchema);