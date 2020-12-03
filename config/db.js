const mongoose = require('mongoose');

const connectDB = async () => {
	const db = `mongodb+srv://${process.env.MONGODB_USERNAME}:${process.env.MONGODB_PASSWORD}@${process.env.MONGODB_CLUSTER}-tnwpj.mongodb.net/${process.env.MONGODB_DBNAME}?retryWrites=true&w=majority`
	try {
		await mongoose.connect(db, {
			useNewUrlParser: true,
			useUnifiedTopology: true,
			useCreateIndex: true,
			useFindAndModify: false,
		});

		console.log('MongoDB Connected...');
	} catch (err) {
		console.log(err.message);

		// Exit process with failure
		process.exit(1);
	}
};

module.exports = connectDB;
