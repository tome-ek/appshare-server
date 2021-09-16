import { UserDto } from './UserDto';

export type AccountDto = {
  readonly id: number;
  readonly firebaseId: string;
  readonly user?: UserDto;
};
