//FILE TO EXECUTE SEEDERS

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const storagePath = path.join(__dirname, '..', process.env.DB_FOLDER, process.env.DB_FILENAME);

export default {
  development: {
    dialect: process.env.DB_DIALECT || 'sqlite',
    storage: storagePath,
    logging: false
  },
  test: {
    dialect: 'sqlite',
    storage: ':memory:',
    logging: false
  },
  production: {
    dialect: process.env.DB_DIALECT || 'sqlite',
    storage: storagePath,
    logging: false
  }
};