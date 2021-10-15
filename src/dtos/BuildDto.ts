import { AppDto } from './AppDto';

export type BuildDto = {
  readonly id: number;
  readonly appId: number;
  readonly version: string;
  readonly buildNumber: string;
  readonly bundleIdentifier: string;
  readonly fileName: string;
  readonly bundleUrl: string;
  readonly bundleName: string;
  readonly iv?: string;
  readonly authTag?: string;
  readonly app?: AppDto;
};
