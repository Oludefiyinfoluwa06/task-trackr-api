const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require('dotenv');

dotenv.config();

const { connectDB } = require('./db');

const healthRouter = require('./routes/health');
const authRouter = require('./routes/auth');
const meRouter = require('./routes/me');
const orgRouter = require('./routes/organization');

const app = express();

app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

app.use('/health', healthRouter);
app.use('/auth', authRouter);
app.use('/me', meRouter);
app.use('/organization', orgRouter);

app.get('/', (req, res) => res.json({ service: 'task-trackr-api', status: 'ok' }));

app.use((req, res) => res.status(404).json({ error: 'Not Found' }));

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal Server Error' });
});

const port = process.env.PORT;

connectDB()
  .then(() => {
    app.listen(port, () => console.log(`task-trackr-api listening on ${port}`));
  })
  .catch((err) => {
    console.error('Failed to start server due to DB connection error', err);
    process.exit(1);
  });
