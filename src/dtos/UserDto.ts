import { AppDto } from './AppDto';
import { ShareLinkDto } from './ShareLinkDto';

export interface UserDto {
  readonly id: number;
  readonly accountId: number;
  readonly apps?: AppDto;
  readonly shareLinks?: ShareLinkDto[];
}
