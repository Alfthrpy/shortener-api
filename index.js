import express from 'express';
import dotenv from "dotenv";
import userRoute from './src/route/userRoute.js';
import shortenerRoute from './src/route/shortenerRoute.js';
import statsRoute from './src/route/statsRoute.js';
import authRoute from './src/route/authRoute.js';
import { swaggerDocs, swaggerUi } from './swagger.js';
import path from 'path'
import { fileURLToPath } from 'url';

dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use('/api/user', userRoute);
app.use('/', shortenerRoute);
app.use('/api/stats', statsRoute);
app.use('/api/auth', authRoute);
app.use('/docs/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));
app.use('/docs/api-docs', express.static(path.join(__dirname, 'node_modules/swagger-ui-dist')));
app.use('/',(req,res)=>{res.json({message:"Hello Developer!"})})

app.use('*', (req, res) => {
    return res.status(404).json({ error: "not-found" });
});

app.listen(port, () => {
    console.log('listening on port ' + port);
});

export default app;
