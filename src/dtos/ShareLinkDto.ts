import { AppDto } from './AppDto';

export type ShareLinkDto = {
  readonly id: number;
  readonly userId: number;
  readonly appId: number;
  readonly token: string;
  readonly tokenId: string;
  readonly shareUrl?: string;
  readonly expiresAt: Date;
  readonly hasPassword: boolean;
  readonly password?: string;
  readonly appAccesses?: ShareLinkDto[];
  readonly app?: AppDto;
};
