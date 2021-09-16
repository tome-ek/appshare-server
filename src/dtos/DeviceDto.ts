export type DeviceDto = {
  readonly id: number;
  readonly name: string;
  readonly systemVersion: string;
  readonly previewImageUrl: string;
  readonly screenWidth?: number;
  readonly screenHeight?: number;
  readonly blueprintId?: string;
};
