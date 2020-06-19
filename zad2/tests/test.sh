npm run clean
npm run createdb
npx ts-node server.ts &
SERVER_PID=$!
npx mocha -r ts-node/register tests/test_solving_quiz.ts
npx mocha -r ts-node/register tests/test_doing_quiz_again.ts
npx mocha -r ts-node/register tests/test_password_reset.ts
kill $SERVER_PID
npm run clean