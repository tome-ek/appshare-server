import { BuildDto } from './BuildDto';
import { ShareLinkDto } from './ShareLinkDto';

export type AppDto = {
  readonly id: number;
  readonly userId: number;
  readonly name: string;
  readonly bundleIdentifier: string;
  readonly iconUrl: string;
  readonly builds?: BuildDto[];
  readonly shareLinks?: ShareLinkDto[];
};
