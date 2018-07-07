import { request } from 'graphql-request';

import { invalidLogin, confirmEmailError } from './errorMessages';
import { User } from '../../entity/User';
import { createTypeormConn } from '../../utils/createTypeormConn';

const email = 'ivan@huya.com';
const password = 'jiqirenbinbgi';

const registerMutation = (e: string, p: string) => `
mutation {
  register(email: "${e}", password:"${p}") {
    path
    message
  }
}
`;

const loginMutation = (e: string, p: string) => `
mutation {
  login(email: "${e}", password:"${p}") {
    path
    message
  }
}
`;

beforeAll(async () => {
  await createTypeormConn();
});

const loginExpectError = async (e: string, p: string, errMsg: string) => {
  const res = await request(
    process.env.TEST_HOST as string,
    loginMutation(e, p)
  );

  expect(res).toEqual({
    login: [{
      path: 'email',
      message: errMsg,
    }]
  });
};

describe('login', () => {
  test('email not found send back error', async () => {
    await loginExpectError('ooo@huya.com', 'whatever', invalidLogin);
  });

  test('email not confirmed', async () => {
    await request(
      process.env.TEST_HOST as string,
      registerMutation(email, password),
    );

    await loginExpectError(email, password, confirmEmailError);

    await User.update({ email }, { confirmed: true });
    
    await loginExpectError(email, 'dawdmawdawdaw', invalidLogin);

    const res = await request(
      process.env.TEST_HOST as string,
      loginMutation(email, password),
    );

    expect(res).toEqual({ login: null });
  });
});