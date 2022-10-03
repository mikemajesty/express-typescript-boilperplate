import { config } from 'dotenv';

import App from './app';
import { HealthRoute } from './modules/health/route';

config();

const app = new App([new HealthRoute()]);

app.listen();
