require('dotenv').config();
if (process.env.DB) {
    require('mongoose').connect(
        process.env.DB,
        {
            useUnifiedTopology: true,
            useNewUrlParser: true, useCreateIndex: true,
            useFindAndModify: false
        })
        .then(() => console.log('DB Connected...'))
        .catch(err => {
            console.log(`DB Connection Error: ${err.message}`);
        });
} else {
    console.log('DB Connection string not configured.');
}
