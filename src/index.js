import express from 'express';
import dotenv from "dotenv";
import userRoute from './route/userRoute.js';
import shortenerRoute from './route/shortenerRoute.js';
import statsRoute from './route/statsRoute.js';
import authRoute from './route/authRoute.js';
import { swaggerDocs, swaggerUi } from '../swagger.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use('/api/user',userRoute)
app.use('/',shortenerRoute);
app.use('/api/stats',statsRoute);
app.use('/api/auth',authRoute)
app.use('/docs/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));


app.use('*', (req, res) => {
    return res.json({error : "not-found"}).status(404)
});

app.listen(port, () => console.log("Server ready on port 3000."));

export default app;



