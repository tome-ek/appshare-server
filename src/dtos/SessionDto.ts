import { AppDto } from './AppDto';
import { BuildDto } from './BuildDto';
import { DeviceDto } from './DeviceDto';
import { UserDto } from './UserDto';

export type SessionDto = {
  readonly id: number;
  readonly sessionId: string;

  readonly buildId: number;
  readonly appId: number;
  readonly deviceId: number;
  readonly userId: number;

  readonly app?: AppDto;
  readonly device?: DeviceDto;
  readonly user?: UserDto;
  readonly build?: BuildDto;
};
