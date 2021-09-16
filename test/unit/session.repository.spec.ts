import 'mocha';
import chai, { expect } from 'chai';
import sinonChai from 'sinon-chai';
import { StubbedInstance, stubInterface } from 'ts-sinon';
import sinon from 'sinon';

import sessionRepository from '../../src/repositories/session.repository';
import { SessionModel, Session } from '../../src/models/session.model';
import { SessionDto } from '../../src/dtos/SessionDto';

chai.use(sinonChai);

describe('SessionRepository', () => {
  describe('createSession', () => {
    it('should create session when valid beta code is provided', async () => {
      // Arrange
      let expectedSessionDto: SessionDto;

      const Session = stubInterface<SessionModel>();
      Session.create.callsFake((values) => {
        expectedSessionDto = { ...values, id: 1 };

        const session: StubbedInstance<Session> = {
          ...stubInterface<Session>(),
          ...values,
          id: 1,
          toJSON: sinon.stub().returns(expectedSessionDto),
        };

        return Promise.resolve(session);
      });

      const repository = sessionRepository(Session);

      // Act
      const resultSession = await repository.createSession(
        {
          buildId: 1,
          appId: 1,
          deviceId: 1,
        },
        1
      );

      // Assert
      expect(resultSession).to.be.deep.equal(expectedSessionDto);
    });
  });
});
