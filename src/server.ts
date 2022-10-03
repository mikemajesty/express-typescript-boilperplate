
require('dotenv').config()

import App from './app';
import { HealthRoute } from './modules/health/route';

const app = new App([new HealthRoute()]);

app.listen();
