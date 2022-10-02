
import App from './app';
import { HealthRoute } from './routes/health';

require('dotenv').config()

const app = new App([new HealthRoute()]);

app.listen();
