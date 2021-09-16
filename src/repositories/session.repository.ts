import { nanoid } from 'nanoid';
import { SessionDto } from '../dtos/SessionDto';
import { SessionModel } from '../models/session.model';

type CreateSessionRequestDto = {
  readonly buildId: number;
  readonly appId: number;
  readonly deviceId: number;
};

export interface SessionRepository {
  createSession: (
    jsonBody: CreateSessionRequestDto,
    userId: number
  ) => Promise<SessionDto>;
}

const sessionRepository = (Session: SessionModel): SessionRepository => {
  return {
    createSession: async (sessionJson, userId) => {
      const sessionId = nanoid(6);
      const session = await Session.create({
        userId,
        sessionId,
        ...sessionJson,
      });
      return <SessionDto>session.toJSON();
    },
  };
};

export default sessionRepository;
