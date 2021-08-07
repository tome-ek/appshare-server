import { nanoid } from 'nanoid';
import Session from '../models/session.model';

export interface SessionRepository {
  createSession: (session: any, userId: number) => Promise<object>;
  getSessions: () => Promise<object[]>;
}

const sessionRepository = (): SessionRepository => {
  return {
    createSession: async (sessionJson, userId) => {
      const sessionId = nanoid(8);
      const session = await Session.create({
        userId,
        sessionId,
        ...sessionJson,
      });
      return session.toJSON();
    },
    getSessions: async () => Session.findAll(),
  };
};

export default sessionRepository;
