import { projectRoot } from './Path.js';
import path from 'path';
import dotenv from 'dotenv';

const envPath = path.join(
    projectRoot, `.env${process.env.NODE_ENV ? `.${process.env.NODE_ENV}` : ``}`
);

//Load env variables
dotenv.config({ path: envPath });