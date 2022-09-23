import express from 'express';
import cors from 'cors';

import PollRouters from './routers/poll.router.js';
import ChoiceRouters from './routers/choice.router.js';
import VoteRouters from './routers/vote.router.js';

const app = express();

app.use(express.json())
app.use(cors())

app.use(PollRouters)
app.use(ChoiceRouters)
app.use(VoteRouters)

app.listen(process.env.PORT, () => {
    console.log("Server running on port " + process.env.PORT);
});