const express = require('express');
const app = express();
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const fileUpload = require('express-fileupload');
require('dotenv').config();
require('express-async-errors');
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGO_URI);

const AuthRouter = require('./routes/AuthRouter');
const UserRouter = require('./routes/UserRouter');
const ProductRouter = require('./routes/ProductRouter');
const ReviewRouter = require('./routes/ReviewRouter');
const OrderRouter = require('./routes/OrderRouter');

const notFoundMiddleware = require('./middleware/not-found');
const errorHandlerMiddleware = require('./middleware/error-handler');

app.use(morgan('tiny'));
app.use(express.json());
app.use(cookieParser(process.env.JWT_SECRET));
app.use(express.static('./public'));
app.use(fileUpload());
app.use('/api/v1/auth', AuthRouter);
app.use('/api/v1/users', UserRouter);
app.use('/api/v1/products', ProductRouter);
app.use('/api/v1/reviews', ReviewRouter);
app.use('/api/v1/orders', OrderRouter);
app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

app.listen(process.env.PORT, console.log(`server is listening on port ${process.env.PORT}`));